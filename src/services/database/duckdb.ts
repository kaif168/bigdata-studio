import * as duckdb from '@duckdb/duckdb-wasm';
import { ColumnSchema, QueryResult, TableSchema } from '@/types';
import { BUILTIN_DATASETS } from '../datasets/mockData';

class DuckDBService {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;
  private initPromise: Promise<void> | null = null;
  private status: 'uninitialized' | 'loading' | 'ready' | 'error' = 'uninitialized';
  private errorMessage: string = '';

  public getStatus() {
    return this.status;
  }

  public getErrorMessage() {
    return this.errorMessage;
  }

  public async initialize(): Promise<void> {
    if (this.status === 'ready' && this.conn) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      this.status = 'loading';
      try {
        let worker: Worker | null = null;
        let mainModule: string = '';
        let pthreadWorker: string | undefined = undefined;

        // Try local static bundles first, fall back to CDN if local bundle fails
        try {
          const manualBundles: duckdb.DuckDBBundles = {
            mvp: {
              mainModule: '/duckdb/duckdb-mvp.wasm',
              mainWorker: '/duckdb/duckdb-browser-mvp.worker.js',
            },
            eh: {
              mainModule: '/duckdb/duckdb-eh.wasm',
              mainWorker: '/duckdb/duckdb-browser-eh.worker.js',
            },
          };
          const bundle = await duckdb.selectBundle(manualBundles);
          worker = new Worker(bundle.mainWorker!);
          mainModule = bundle.mainModule;
          pthreadWorker = bundle.pthreadWorker ?? undefined;
        } catch (localErr) {
          console.warn('Local DuckDB worker load failed, falling back to CDN bundles:', localErr);
          const cdnBundles = duckdb.getJsDelivrBundles();
          const bundle = await duckdb.selectBundle(cdnBundles);
          worker = new Worker(bundle.mainWorker!);
          mainModule = bundle.mainModule;
          pthreadWorker = bundle.pthreadWorker ?? undefined;
        }

        const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
        const db = new duckdb.AsyncDuckDB(logger, worker!);
        await db.instantiate(mainModule!, pthreadWorker);
        const conn = await db.connect();

        this.db = db;
        this.conn = conn;
        this.status = 'ready';

        // Load built-in demonstration tables
        await this.seedBuiltinTables();
      } catch (err: any) {
        console.error('Failed to initialize DuckDB-Wasm:', err);
        this.status = 'error';
        this.errorMessage = err?.message || 'Failed to initialize DuckDB engine.';
        throw err;
      }
    })();

    return this.initPromise;
  }

  private async seedBuiltinTables(): Promise<void> {
    if (!this.db || !this.conn) return;

    for (const dataset of BUILTIN_DATASETS) {
      try {
        const fileName = `${dataset.tableName}.json`;
        const jsonContent = JSON.stringify(dataset.data);
        await this.db.registerFileText(fileName, jsonContent);
        await this.conn.query(
          `CREATE OR REPLACE TABLE ${dataset.tableName} AS SELECT * FROM read_json_auto('${fileName}');`
        );
      } catch (err) {
        console.error(`Failed to register table ${dataset.tableName}:`, err);
      }
    }
  }

  public async executeQuery(sql: string): Promise<QueryResult> {
    const startTime = performance.now();
    await this.initialize();

    if (!this.conn) {
      throw new Error('DuckDB connection is not available.');
    }

    const trimmedSql = sql.trim();
    if (!trimmedSql) {
      return {
        columns: [],
        columnTypes: {},
        rows: [],
        totalRows: 0,
        executionTimeMs: 0,
        sql,
      };
    }

    try {
      const arrowResult = await this.conn.query(trimmedSql);
      const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

      const fields = arrowResult.schema?.fields || [];
      const columns = fields.map((f: any) => f.name);
      const columnTypes: Record<string, string> = {};
      fields.forEach((f: any) => {
        columnTypes[f.name] = f.type ? f.type.toString() : 'UNKNOWN';
      });

      const totalRows = arrowResult.numRows;
      const rows: Record<string, any>[] = [];

      for (let i = 0; i < totalRows; i++) {
        const row: Record<string, any> = {};
        for (const col of columns) {
          let val = arrowResult.getChild(col)?.get(i);
          if (typeof val === 'bigint') {
            val = Number(val);
          } else if (val instanceof Date) {
            val = val.toISOString();
          }
          row[col] = val;
        }
        rows.push(row);
      }

      return {
        columns,
        columnTypes,
        rows,
        totalRows,
        executionTimeMs,
        sql,
      };
    } catch (err: any) {
      const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
      throw {
        sql,
        executionTimeMs,
        message: err?.message || String(err),
      };
    }
  }

  public async getAvailableTables(): Promise<TableSchema[]> {
    await this.initialize();
    if (!this.conn) return [];

    try {
      const tablesResult = await this.conn.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'main' ORDER BY table_name;`
      );

      const tableNames: string[] = [];
      for (let i = 0; i < tablesResult.numRows; i++) {
        tableNames.push(tablesResult.getChild('table_name')?.get(i));
      }

      const schemas: TableSchema[] = [];

      for (const tName of tableNames) {
        // Count rows
        const countRes = await this.conn.query(`SELECT COUNT(*) AS cnt FROM "${tName}";`);
        const countBig = countRes.getChild('cnt')?.get(0);
        const rowCount = typeof countBig === 'bigint' ? Number(countBig) : (countBig || 0);

        // Get columns
        const pragmaRes = await this.conn.query(`PRAGMA table_info('${tName}');`);
        const columns: ColumnSchema[] = [];
        for (let j = 0; j < pragmaRes.numRows; j++) {
          const colName = pragmaRes.getChild('name')?.get(j);
          const colType = pragmaRes.getChild('type')?.get(j);
          const notNull = pragmaRes.getChild('notnull')?.get(j);
          columns.push({
            name: colName,
            type: colType || 'VARCHAR',
            nullable: !notNull,
          });
        }

        const builtinMatch = BUILTIN_DATASETS.find(b => b.tableName.toLowerCase() === tName.toLowerCase());

        schemas.push({
          tableName: tName,
          rowCount,
          columns,
          description: builtinMatch ? builtinMatch.description : 'User uploaded analytical dataset.',
          isCustom: !builtinMatch,
          sourceType: builtinMatch ? 'builtin' : 'csv',
        });
      }

      return schemas;
    } catch (err) {
      console.error('Failed to list tables:', err);
      return [];
    }
  }

  public async importCsv(tableName: string, csvContent: string): Promise<TableSchema> {
    await this.initialize();
    if (!this.db || !this.conn) throw new Error('DuckDB not initialized');

    const cleanName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const fileName = `${cleanName}.csv`;

    await this.db.registerFileText(fileName, csvContent);
    await this.conn.query(
      `CREATE OR REPLACE TABLE "${cleanName}" AS SELECT * FROM read_csv_auto('${fileName}');`
    );

    const tables = await this.getAvailableTables();
    const created = tables.find(t => t.tableName === cleanName);
    if (!created) {
      throw new Error(`Table ${cleanName} could not be retrieved after import.`);
    }
    return created;
  }

  public async importJson(tableName: string, jsonContent: string): Promise<TableSchema> {
    await this.initialize();
    if (!this.db || !this.conn) throw new Error('DuckDB not initialized');

    const cleanName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const fileName = `${cleanName}.json`;

    // Validate JSON format
    JSON.parse(jsonContent);

    await this.db.registerFileText(fileName, jsonContent);
    await this.conn.query(
      `CREATE OR REPLACE TABLE "${cleanName}" AS SELECT * FROM read_json_auto('${fileName}');`
    );

    const tables = await this.getAvailableTables();
    const created = tables.find(t => t.tableName === cleanName);
    if (!created) {
      throw new Error(`Table ${cleanName} could not be retrieved after import.`);
    }
    return created;
  }

  public async dropTable(tableName: string): Promise<void> {
    await this.initialize();
    if (!this.conn) return;
    await this.conn.query(`DROP TABLE IF EXISTS "${tableName}";`);
  }

  public async resetEnvironment(): Promise<void> {
    await this.initialize();
    if (!this.conn) return;

    const tables = await this.getAvailableTables();
    for (const t of tables) {
      await this.conn.query(`DROP TABLE IF EXISTS "${t.tableName}";`);
    }
    await this.seedBuiltinTables();
  }
}

export const duckDBService = new DuckDBService();
