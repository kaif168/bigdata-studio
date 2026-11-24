import { ChallengeProgress, QueryHistoryItem, SavedQuery, UserPreferences } from '@/types';

const STORAGE_KEYS = {
  QUERY_HISTORY: 'bigdata_studio_query_history',
  SAVED_QUERIES: 'bigdata_studio_saved_queries',
  CHALLENGE_PROGRESS: 'bigdata_studio_challenge_progress',
  USER_PREFERENCES: 'bigdata_studio_preferences',
  CUSTOM_TABLES: 'bigdata_studio_custom_tables',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  editorFontSize: 14,
  editorWordWrap: true,
  resultsPageSize: 15,
  autoFormatSql: true,
  studentName: 'Data Analytics Scholar',
  studentRollNumber: 'BDA-2024-88',
  courseTitle: 'Big Data Analytics (CS801)',
};

export interface StoredCustomTable {
  tableName: string;
  type: 'csv' | 'json';
  content: string;
  createdAt: number;
}

export class StorageService {
  // Query History
  public static getQueryHistory(): QueryHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUERY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addQueryHistory(item: Omit<QueryHistoryItem, 'id' | 'timestamp'>): QueryHistoryItem {
    const history = this.getQueryHistory();
    const newItem: QueryHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    // Keep last 150 entries to conserve browser memory
    const updated = [newItem, ...history].slice(0, 150);
    try {
      localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, trimming history:', e);
      localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(updated.slice(0, 50)));
    }
    return newItem;
  }

  public static clearQueryHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.QUERY_HISTORY);
  }

  public static deleteQueryHistoryItem(id: string): void {
    const history = this.getQueryHistory().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(history));
  }

  // Saved Queries
  public static getSavedQueries(): SavedQuery[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_QUERIES);
      if (data) return JSON.parse(data);

      // Starter initial saved queries
      const starters: SavedQuery[] = [
        {
          id: 'sq_starter_1',
          title: 'Top 5 Product Categories by Revenue',
          sql: `SELECT \n    category,\n    COUNT(*) AS total_orders,\n    ROUND(SUM(amount), 2) AS total_revenue\nFROM sales\nGROUP BY category\nORDER BY total_revenue DESC\nLIMIT 5;`,
          dataset: 'sales',
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 86400000,
          description: 'Aggregates sales volume and overall revenue grouped by product category.',
          tags: ['Aggregation', 'Sales', 'GROUP BY'],
        },
        {
          id: 'sq_starter_2',
          title: 'Department Average Exam Scores vs Attendance',
          sql: `SELECT \n    department,\n    ROUND(AVG(attendance_percentage), 1) AS avg_attendance,\n    ROUND(AVG(exam_score), 1) AS avg_exam_score,\n    COUNT(*) AS student_count\nFROM students\nGROUP BY department\nORDER BY avg_exam_score DESC;`,
          dataset: 'students',
          createdAt: Date.now() - 43200000,
          updatedAt: Date.now() - 43200000,
          description: 'Comparative metric evaluating academic scores against attendance rates.',
          tags: ['Academic', 'Students', 'Averages'],
        },
        {
          id: 'sq_starter_3',
          title: 'IoT Sensor Critical Thermal Anomalies',
          sql: `SELECT \n    sensor_id,\n    location,\n    temperature,\n    humidity,\n    recorded_at\nFROM sensor_readings\nWHERE status = 'ALERT' OR temperature > 28.0\nORDER BY temperature DESC;`,
          dataset: 'sensor_readings',
          createdAt: Date.now() - 20000000,
          updatedAt: Date.now() - 20000000,
          description: 'Identifies hardware sensors operating beyond standard thermal safety parameters.',
          tags: ['IoT', 'Filtering', 'Alerts'],
        },
      ];
      this.saveAllQueries(starters);
      return starters;
    } catch {
      return [];
    }
  }

  public static saveQuery(query: Omit<SavedQuery, 'id' | 'createdAt' | 'updatedAt'>): SavedQuery {
    const list = this.getSavedQueries();
    const newQuery: SavedQuery = {
      ...query,
      id: `sq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.saveAllQueries([newQuery, ...list]);
    return newQuery;
  }

  public static updateSavedQuery(id: string, updates: Partial<Omit<SavedQuery, 'id' | 'createdAt'>>): SavedQuery | null {
    const list = this.getSavedQueries();
    const index = list.findIndex(q => q.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveAllQueries(list);
    return list[index];
  }

  public static deleteSavedQuery(id: string): void {
    const list = this.getSavedQueries().filter(q => q.id !== id);
    this.saveAllQueries(list);
  }

  private static saveAllQueries(queries: SavedQuery[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify(queries));
    } catch (e) {
      console.error('Failed to save queries:', e);
    }
  }

  // Challenge Progress
  public static getChallengeProgress(): Record<string, ChallengeProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHALLENGE_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public static saveChallengeProgress(progress: ChallengeProgress): void {
    const current = this.getChallengeProgress();
    current[progress.challengeId] = progress;
    try {
      localStorage.setItem(STORAGE_KEYS.CHALLENGE_PROGRESS, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save challenge progress:', e);
    }
  }

  // Preferences
  public static getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  public static savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }
    return updated;
  }

  // Custom Tables Storage
  public static getStoredCustomTables(): StoredCustomTable[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TABLES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveCustomTable(table: StoredCustomTable): void {
    const tables = this.getStoredCustomTables().filter(t => t.tableName !== table.tableName);
    tables.push(table);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TABLES, JSON.stringify(tables));
    } catch (e) {
      console.warn('Could not persist custom table in localStorage:', e);
    }
  }

  public static removeCustomTable(tableName: string): void {
    const tables = this.getStoredCustomTables().filter(t => t.tableName !== tableName);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TABLES, JSON.stringify(tables));
  }
}
