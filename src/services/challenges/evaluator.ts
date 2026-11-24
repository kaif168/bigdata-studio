import { QueryResult, SqlChallenge } from '@/types';
import { duckDBService } from '../database/duckdb';

export interface EvaluationResult {
  passed: boolean;
  message: string;
  userResult?: QueryResult;
  solutionResult?: QueryResult;
  discrepancy?: string;
}

export class ChallengeEvaluator {
  public static async evaluate(
    challenge: SqlChallenge,
    userSql: string
  ): Promise<EvaluationResult> {
    const trimmed = userSql.trim();
    if (!trimmed) {
      return {
        passed: false,
        message: 'Query is empty. Please enter your SQL query.',
      };
    }

    let userResult: QueryResult;
    try {
      userResult = await duckDBService.executeQuery(trimmed);
    } catch (err: any) {
      return {
        passed: false,
        message: `Execution Error: ${err.message || 'Syntax or runtime SQL error.'}`,
      };
    }

    let solutionResult: QueryResult;
    try {
      solutionResult = await duckDBService.executeQuery(challenge.solutionSql);
    } catch (err: any) {
      return {
        passed: false,
        message: `Internal error executing reference solution: ${err.message || String(err)}`,
        userResult,
      };
    }

    // 1. Check row counts
    if (userResult.totalRows !== solutionResult.totalRows) {
      return {
        passed: false,
        message: `Row count mismatch: Expected ${solutionResult.totalRows} rows, but your query returned ${userResult.totalRows} rows.`,
        userResult,
        solutionResult,
        discrepancy: `Expected ${solutionResult.totalRows} rows, got ${userResult.totalRows}`,
      };
    }

    // 2. Check column count
    if (userResult.columns.length !== solutionResult.columns.length) {
      return {
        passed: false,
        message: `Column count mismatch: Expected ${solutionResult.columns.length} columns (${solutionResult.columns.join(', ')}), but your query returned ${userResult.columns.length} columns (${userResult.columns.join(', ')}).`,
        userResult,
        solutionResult,
        discrepancy: `Expected columns: ${solutionResult.columns.join(', ')}`,
      };
    }

    // 3. Compare values row by row
    const requiresOrdering = challenge.solutionSql.toUpperCase().includes('ORDER BY');

    const normUserRows = userResult.rows.map(r => this.normalizeRow(r, userResult.columns));
    const normSolRows = solutionResult.rows.map(r => this.normalizeRow(r, solutionResult.columns));

    if (!requiresOrdering) {
      normUserRows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      normSolRows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }

    for (let r = 0; r < normSolRows.length; r++) {
      const uRow = normUserRows[r];
      const sRow = normSolRows[r];

      for (let c = 0; c < solutionResult.columns.length; c++) {
        const uVal = uRow[c];
        const sVal = sRow[c];

        if (!this.areValuesEqual(uVal, sVal)) {
          const colName = solutionResult.columns[c];
          return {
            passed: false,
            message: `Value mismatch at row ${r + 1} for column '${colName}': Expected '${sVal}', but got '${uVal}'.`,
            userResult,
            solutionResult,
            discrepancy: `Row ${r + 1}, column ${colName}: expected ${sVal}, got ${uVal}`,
          };
        }
      }
    }

    return {
      passed: true,
      message: `Excellent! Your query returned the exact expected dataset with ${userResult.totalRows} rows and ${userResult.columns.length} columns in ${userResult.executionTimeMs} ms!`,
      userResult,
      solutionResult,
    };
  }

  private static normalizeRow(row: Record<string, any>, columns: string[]): any[] {
    return columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return null;
      if (typeof val === 'number') return Number(val.toFixed(2));
      if (typeof val === 'string') return val.trim();
      return val;
    });
  }

  private static areValuesEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;

    // Numeric comparison with epsilon
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB) && typeof a !== 'boolean' && typeof b !== 'boolean') {
      return Math.abs(numA - numB) < 0.05;
    }

    // String comparison case-insensitive
    if (typeof a === 'string' && typeof b === 'string') {
      return a.trim().toLowerCase() === b.trim().toLowerCase();
    }

    return false;
  }
}
