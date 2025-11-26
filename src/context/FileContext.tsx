'use client';

import { createContext, useContext, ReactNode } from 'react';
import { CodeFile } from '@/types';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileContextType {
  file: CodeFile | null;
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  handleDragEnter: () => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearFile: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const fileUpload = useFileUpload();

  return (
    <FileContext.Provider value={fileUpload}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
}
