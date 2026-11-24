import { describe, it, expect } from 'vitest';
import { MapReduceEngine } from '../services/mapreduce/simulator';
import { BUILTIN_DATASETS } from '../services/datasets/mockData';
import { QUERY_LIBRARY } from '../data/queryLibrary';
import { SQL_CHALLENGES } from '../data/challenges';
import { formatNumber, formatDuration, truncate } from '../utils/formatters';

describe('MapReduce Execution Engine', () => {
  it('correctly executes Word Count for "big data is big data"', () => {
    const state = MapReduceEngine.simulate('big data is big data', 2, 2);

    expect(state.splits.length).toBe(2);
    expect(state.allMapPairs.length).toBe(5);

    // Verify final word counts
    const bigResult = state.finalResults.find(r => r.key === 'big');
    const dataResult = state.finalResults.find(r => r.key === 'data');
    const isResult = state.finalResults.find(r => r.key === 'is');

    expect(bigResult?.value).toBe(2);
    expect(dataResult?.value).toBe(2);
    expect(isResult?.value).toBe(1);
  });

  it('handles empty input gracefully', () => {
    const state = MapReduceEngine.simulate('', 2, 2);
    expect(state.splits.length).toBe(0);
    expect(state.finalResults.length).toBe(0);
  });

  it('strips punctuation and normalizes casing', () => {
    const state = MapReduceEngine.simulate('Hadoop! HADOOP? hadoop...', 2, 2);
    expect(state.finalResults.length).toBe(1);
    expect(state.finalResults[0].key).toBe('hadoop');
    expect(state.finalResults[0].value).toBe(3);
  });
});

describe('Synthetic Datasets Generation & Schemas', () => {
  it('contains all 6 required analytical tables', () => {
    const tableNames = BUILTIN_DATASETS.map(d => d.tableName);
    expect(tableNames).toContain('sales');
    expect(tableNames).toContain('students');
    expect(tableNames).toContain('web_events');
    expect(tableNames).toContain('sensor_readings');
    expect(tableNames).toContain('retail_transactions');
    expect(tableNames).toContain('employees');
  });

  it('generates expected columns and non-empty rows for sales', () => {
    const sales = BUILTIN_DATASETS.find(d => d.tableName === 'sales');
    expect(sales).toBeDefined();
    expect(sales!.data.length).toBeGreaterThanOrEqual(100);

    const first = sales!.data[0];
    expect(first).toHaveProperty('order_id');
    expect(first).toHaveProperty('amount');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('payment_method');
  });

  it('generates academic columns for students table', () => {
    const students = BUILTIN_DATASETS.find(d => d.tableName === 'students');
    expect(students).toBeDefined();
    expect(students!.data.length).toBeGreaterThanOrEqual(50);

    const first = students!.data[0];
    expect(first).toHaveProperty('student_id');
    expect(first).toHaveProperty('attendance_percentage');
    expect(first).toHaveProperty('exam_score');
  });
});

describe('Curated Query Library Integrity', () => {
  it('contains at least 30 verified queries', () => {
    expect(QUERY_LIBRARY.length).toBeGreaterThanOrEqual(30);
  });

  it('includes Beginner, Intermediate, and Advanced tiers', () => {
    const difficulties = new Set(QUERY_LIBRARY.map(q => q.difficulty));
    expect(difficulties.has('Beginner')).toBe(true);
    expect(difficulties.has('Intermediate')).toBe(true);
    expect(difficulties.has('Advanced')).toBe(true);
  });

  it('ensures each query targets a valid built-in table', () => {
    const validTables = ['sales', 'students', 'web_events', 'sensor_readings', 'retail_transactions', 'employees'];
    QUERY_LIBRARY.forEach(q => {
      expect(validTables).toContain(q.dataset);
      expect(q.sql).toContain('SELECT');
    });
  });
});

describe('Practical SQL Challenges Integrity', () => {
  it('contains at least 25 practical challenges', () => {
    expect(SQL_CHALLENGES.length).toBeGreaterThanOrEqual(25);
  });

  it('ensures every challenge has initialSql and solutionSql', () => {
    SQL_CHALLENGES.forEach(ch => {
      expect(ch.initialSql.length).toBeGreaterThan(5);
      expect(ch.solutionSql.length).toBeGreaterThan(5);
      expect(ch.score).toBeGreaterThan(0);
      expect(ch.hint.length).toBeGreaterThan(5);
    });
  });
});

describe('Utility Formatters', () => {
  it('formats numbers with thousand separators and decimals', () => {
    expect(formatNumber(1250000.5, 2)).toBe('1,250,000.50');
    expect(formatNumber(null)).toBe('—');
  });

  it('formats latency durations accurately', () => {
    expect(formatDuration(0.4)).toBe('< 1 ms');
    expect(formatDuration(45.2)).toBe('45.2 ms');
    expect(formatDuration(1500)).toBe('1.50 s');
  });

  it('truncates strings cleanly', () => {
    expect(truncate('BigData Studio Interactive Analytics', 15)).toBe('BigData Studio ...');
  });
});
