// Severity levels for code review issues
export enum IssueSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  SUGGESTION = 'suggestion',
}

// Categories for code review issues
export enum IssueCategory {
  READABILITY = 'readability',
  MODULARITY = 'modularity',
  BUG = 'bug',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  BEST_PRACTICE = 'best-practice',
}

// Supported programming languages
export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  C = 'c',
  GOLANG = 'go',
  RUST = 'rust',
  JSX = 'jsx',
  TSX = 'tsx',
}

// Single code file
export interface CodeFile {
  name: string;
  content: string;
  language: ProgrammingLanguage;
  size: number;
}

// Individual code review issue
export interface ReviewIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  line?: number;
  description: string;
  suggestion: string;
  codeSnippet?: string;
}

// Complete code review result
export interface ReviewResult {
  summary: string;
  overallScore: number; // 1-10
  issues: ReviewIssue[];
  improvements: string[];
  positives: string[];
}

// Metadata for analysis
export interface AnalysisMetadata {
  linesOfCode: number;
  analysisTime: number; // milliseconds
  model: string;
}

// Complete report document stored in database
export interface Report {
  _id?: string;
  fileName: string;
  language: ProgrammingLanguage;
  originalCode: string;
  review: ReviewResult;
  metadata: AnalysisMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

// API response for file upload
export interface UploadResponse {
  success: boolean;
  file?: CodeFile;
  error?: string;
}

// API request body for code review
export interface ReviewRequest {
  code: string;
  language: ProgrammingLanguage;
  fileName: string;
}

// API response for code review
export interface ReviewResponse {
  success: boolean;
  report?: Report;
  error?: string;
}

// Paginated reports response
export interface ReportsListResponse {
  success: boolean;
  reports?: Report[];
  total?: number;
  page?: number;
  totalPages?: number;
  error?: string;
}

// Single report response
export interface SingleReportResponse {
  success: boolean;
  report?: Report;
  error?: string;
}
