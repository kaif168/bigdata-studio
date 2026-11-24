export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'error';

export interface ColumnSchema {
  name: string;
  type: string;
  nullable?: boolean;
}

export interface TableSchema {
  tableName: string;
  rowCount: number;
  columns: ColumnSchema[];
  description?: string;
  isCustom?: boolean;
  sourceType?: 'builtin' | 'csv' | 'json';
}

export interface QueryResult {
  columns: string[];
  columnTypes: Record<string, string>;
  rows: Record<string, any>[];
  totalRows: number;
  executionTimeMs: number;
  sql: string;
  error?: string;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  dataset: string;
  status: 'success' | 'error';
  executionTimeMs: number;
  rowCount?: number;
  error?: string;
  timestamp: number;
}

export interface SavedQuery {
  id: string;
  title: string;
  sql: string;
  dataset: string;
  createdAt: number;
  updatedAt: number;
  description?: string;
  tags?: string[];
}

export interface QueryExample {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  objective: string;
  dataset: string;
  sql: string;
  explanation: string;
  expectedResult: string;
}

export interface SqlChallenge {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  dataset: string;
  objective: string;
  problemStatement: string;
  initialSql: string;
  solutionSql: string;
  hint: string;
  explanation: string;
  score: number;
  tags: string[];
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  completedAt?: number;
  userSql?: string;
  scoreEarned: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LearningTopic {
  id: string;
  moduleId: string;
  title: string;
  badge: string;
  readTimeMinutes: number;
  summary: string;
  definition: string;
  explanation: string;
  architectureDiagram?: string;
  howItWorks: string[];
  realWorldApplications: string[];
  advantages: string[];
  limitations: string[];
  codeExample?: {
    language: string;
    code: string;
    description: string;
  };
  quiz: QuizQuestion[];
  relatedTopicIds: string[];
}

export interface LearningModule {
  id: string;
  number: number;
  title: string;
  iconName: string;
  description: string;
  topics: LearningTopic[];
}

export interface MapReduceStep {
  stepIndex: number;
  name: string;
  title: string;
  description: string;
  data: any;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  editorFontSize: number;
  editorWordWrap: boolean;
  resultsPageSize: number;
  autoFormatSql: boolean;
  studentName: string;
  studentRollNumber: string;
  courseTitle: string;
}
