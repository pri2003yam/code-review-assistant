import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProgrammingLanguage } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Map file extensions to programming languages
const extensionToLanguage: Record<string, ProgrammingLanguage> = {
  js: ProgrammingLanguage.JAVASCRIPT,
  jsx: ProgrammingLanguage.JSX,
  ts: ProgrammingLanguage.TYPESCRIPT,
  tsx: ProgrammingLanguage.TSX,
  py: ProgrammingLanguage.PYTHON,
  java: ProgrammingLanguage.JAVA,
  cpp: ProgrammingLanguage.CPP,
  cc: ProgrammingLanguage.CPP,
  cxx: ProgrammingLanguage.CPP,
  c: ProgrammingLanguage.C,
  go: ProgrammingLanguage.GOLANG,
  rs: ProgrammingLanguage.RUST,
};

// Detect programming language from file extension
export function detectLanguage(fileName: string): ProgrammingLanguage | null {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) return null;
  return extensionToLanguage[extension] || null;
}

// Validate if file type is supported
export function isSupportedFileType(fileName: string): boolean {
  return detectLanguage(fileName) !== null;
}

// Get language display name
export function getLanguageDisplayName(language: ProgrammingLanguage): string {
  const displayNames: Record<ProgrammingLanguage, string> = {
    [ProgrammingLanguage.JAVASCRIPT]: 'JavaScript',
    [ProgrammingLanguage.TYPESCRIPT]: 'TypeScript',
    [ProgrammingLanguage.PYTHON]: 'Python',
    [ProgrammingLanguage.JAVA]: 'Java',
    [ProgrammingLanguage.CPP]: 'C++',
    [ProgrammingLanguage.C]: 'C',
    [ProgrammingLanguage.GOLANG]: 'Go',
    [ProgrammingLanguage.RUST]: 'Rust',
    [ProgrammingLanguage.JSX]: 'JSX',
    [ProgrammingLanguage.TSX]: 'TSX',
  };
  return displayNames[language] || language;
}

// Get Monaco Editor language from our language type
export function getMonacoLanguage(language: ProgrammingLanguage): string {
  const monacoLanguages: Record<ProgrammingLanguage, string> = {
    [ProgrammingLanguage.JAVASCRIPT]: 'javascript',
    [ProgrammingLanguage.TYPESCRIPT]: 'typescript',
    [ProgrammingLanguage.PYTHON]: 'python',
    [ProgrammingLanguage.JAVA]: 'java',
    [ProgrammingLanguage.CPP]: 'cpp',
    [ProgrammingLanguage.C]: 'c',
    [ProgrammingLanguage.GOLANG]: 'go',
    [ProgrammingLanguage.RUST]: 'rust',
    [ProgrammingLanguage.JSX]: 'javascript',
    [ProgrammingLanguage.TSX]: 'typescript',
  };
  return monacoLanguages[language] || 'plaintext';
}

// Format file size in human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format date in readable format
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get color for severity level
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'suggestion':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

// Get icon for severity level
export function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'warning':
      return '🟡';
    case 'suggestion':
      return '🔵';
    default:
      return '⚪';
  }
}

// Get color for category
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'readability':
      return 'bg-purple-100 text-purple-800';
    case 'modularity':
      return 'bg-green-100 text-green-800';
    case 'bug':
      return 'bg-red-100 text-red-800';
    case 'performance':
      return 'bg-orange-100 text-orange-800';
    case 'security':
      return 'bg-pink-100 text-pink-800';
    case 'best-practice':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Validate code size (max 100KB)
export function isValidCodeSize(code: string): boolean {
  const sizeInBytes = new Blob([code]).size;
  return sizeInBytes <= 100 * 1024; // 100KB
}

// Get error message for validation
export function getValidationErrorMessage(fileName: string, size: number): string | null {
  if (!isSupportedFileType(fileName)) {
    return 'Unsupported file type. Supported: .js, .ts, .jsx, .tsx, .py, .java, .cpp, .c, .go, .rs';
  }
  if (size > 100 * 1024) {
    return 'File size exceeds 100KB limit';
  }
  return null;
}
