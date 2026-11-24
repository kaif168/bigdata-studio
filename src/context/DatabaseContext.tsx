import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { EngineStatus, QueryResult, TableSchema } from '@/types';
import { duckDBService } from '@/services/database/duckdb';
import { StorageService } from '@/services/persistence/storage';

interface DatabaseContextType {
  engineStatus: EngineStatus;
  errorMessage: string;
  availableTables: TableSchema[];
  activeTable: string;
  setActiveTable: (table: string) => void;
  lastQueryResult: QueryResult | null;
  setLastQueryResult: (res: QueryResult | null) => void;
  executeQuery: (sql: string, datasetName?: string) => Promise<QueryResult>;
  refreshTables: () => Promise<void>;
  importCsv: (name: string, content: string) => Promise<TableSchema>;
  importJson: (name: string, content: string) => Promise<TableSchema>;
  dropTable: (name: string) => Promise<void>;
  resetEnvironment: () => Promise<void>;
  totalQueriesExecuted: number;
  successfulQueriesCount: number;
  lastExecutionDuration: number;
  activeDatasetRowCount: number;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('uninitialized');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [availableTables, setAvailableTables] = useState<TableSchema[]>([]);
  const [activeTable, setActiveTable] = useState<string>('sales');
  const [lastQueryResult, setLastQueryResult] = useState<QueryResult | null>(null);

  // Real KPIs based on user activity
  const [totalQueriesExecuted, setTotalQueriesExecuted] = useState<number>(0);
  const [successfulQueriesCount, setSuccessfulQueriesCount] = useState<number>(0);
  const [lastExecutionDuration, setLastExecutionDuration] = useState<number>(0);

  const refreshTables = useCallback(async () => {
    try {
      const tables = await duckDBService.getAvailableTables();
      setAvailableTables(tables);
      if (tables.length > 0 && !tables.some(t => t.tableName === activeTable)) {
        setActiveTable(tables[0].tableName);
      }
    } catch (err: any) {
      console.error('Error refreshing tables:', err);
    }
  }, [activeTable]);

  // Initialize DuckDB-Wasm engine on mount
  useEffect(() => {
    let isMounted = true;

    const initEngine = async () => {
      setEngineStatus('loading');
      try {
        await duckDBService.initialize();
        if (!isMounted) return;

        // Restore custom user tables from storage if any
        const storedCustom = StorageService.getStoredCustomTables();
        for (const item of storedCustom) {
          try {
            if (item.type === 'csv') {
              await duckDBService.importCsv(item.tableName, item.content);
            } else {
              await duckDBService.importJson(item.tableName, item.content);
            }
          } catch (customErr) {
            console.warn(`Could not restore custom table ${item.tableName}:`, customErr);
          }
        }

        const tables = await duckDBService.getAvailableTables();
        if (isMounted) {
          setAvailableTables(tables);
          setEngineStatus('ready');
          if (tables.length > 0) {
            setActiveTable(tables[0].tableName);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setEngineStatus('error');
          setErrorMessage(err?.message || 'Failed to initialize DuckDB engine.');
        }
      }
    };

    initEngine();

    return () => {
      isMounted = false;
    };
  }, []);

  const executeQuery = useCallback(async (sql: string, datasetName?: string): Promise<QueryResult> => {
    const targetDataset = datasetName || activeTable;
    setTotalQueriesExecuted(prev => prev + 1);

    try {
      const result = await duckDBService.executeQuery(sql);
      setSuccessfulQueriesCount(prev => prev + 1);
      setLastExecutionDuration(result.executionTimeMs);
      setLastQueryResult(result);

      // Persist in history
      StorageService.addQueryHistory({
        sql,
        dataset: targetDataset,
        status: 'success',
        executionTimeMs: result.executionTimeMs,
        rowCount: result.totalRows,
      });

      return result;
    } catch (err: any) {
      const duration = err.executionTimeMs || 0;
      setLastExecutionDuration(duration);

      // Persist error in history
      StorageService.addQueryHistory({
        sql,
        dataset: targetDataset,
        status: 'error',
        executionTimeMs: duration,
        error: err.message || String(err),
      });

      throw err;
    }
  }, [activeTable]);

  const importCsv = useCallback(async (name: string, content: string): Promise<TableSchema> => {
    const schema = await duckDBService.importCsv(name, content);
    StorageService.saveCustomTable({
      tableName: schema.tableName,
      type: 'csv',
      content,
      createdAt: Date.now(),
    });
    await refreshTables();
    setActiveTable(schema.tableName);
    return schema;
  }, [refreshTables]);

  const importJson = useCallback(async (name: string, content: string): Promise<TableSchema> => {
    const schema = await duckDBService.importJson(name, content);
    StorageService.saveCustomTable({
      tableName: schema.tableName,
      type: 'json',
      content,
      createdAt: Date.now(),
    });
    await refreshTables();
    setActiveTable(schema.tableName);
    return schema;
  }, [refreshTables]);

  const dropTable = useCallback(async (name: string): Promise<void> => {
    await duckDBService.dropTable(name);
    StorageService.removeCustomTable(name);
    await refreshTables();
  }, [refreshTables]);

  const resetEnvironment = useCallback(async () => {
    setEngineStatus('loading');
    await duckDBService.resetEnvironment();
    await refreshTables();
    setEngineStatus('ready');
  }, [refreshTables]);

  const currentTableSchema = availableTables.find(t => t.tableName === activeTable);
  const activeDatasetRowCount = currentTableSchema?.rowCount || 0;

  return (
    <DatabaseContext.Provider
      value={{
        engineStatus,
        errorMessage,
        availableTables,
        activeTable,
        setActiveTable,
        lastQueryResult,
        setLastQueryResult,
        executeQuery,
        refreshTables,
        importCsv,
        importJson,
        dropTable,
        resetEnvironment,
        totalQueriesExecuted,
        successfulQueriesCount,
        lastExecutionDuration,
        activeDatasetRowCount,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
