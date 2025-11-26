'use client';

import { useState, useCallback } from 'react';
import { CodeFile } from '@/types';
import { isSupportedFileType, getValidationErrorMessage } from '@/lib/utils';
import { UploadResponse } from '@/types';

interface UseFileUploadState {
  file: CodeFile | null;
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useFileUpload() {
  const [state, setState] = useState<UseFileUploadState>({
    file: null,
    isDragging: false,
    isLoading: false,
    error: null,
  });

  const handleDragEnter = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const validateAndUpload = useCallback(async (file: File) => {
    // Reset error
    setState((prev) => ({ ...prev, error: null }));

    // Validate file type
    const validationError = getValidationErrorMessage(file.name, file.size);
    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.success) {
        setState((prev) => ({
          ...prev,
          error: data.error || 'Upload failed',
          isLoading: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        file: data.file || null,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
      }));
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => ({ ...prev, isDragging: false }));

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await validateAndUpload(files[0]);
      }
    },
    [validateAndUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await validateAndUpload(files[0]);
      }
    },
    [validateAndUpload]
  );

  const clearFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      file: null,
      error: null,
      isDragging: false,
    }));
  }, []);

  return {
    file: state.file,
    isDragging: state.isDragging,
    isLoading: state.isLoading,
    error: state.error,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    clearFile,
  };
}
