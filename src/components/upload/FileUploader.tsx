'use client';

import { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { useFileContext } from '@/context/FileContext';

interface FileUploaderProps {
  onFileLoaded?: () => void;
}

export function FileUploader({ onFileLoaded }: FileUploaderProps) {
  const { file, isDragging, isLoading, error, handleDragEnter, handleDragLeave, handleDrop, handleFileSelect, clearFile } = useFileContext();

  const handleClick = useCallback(() => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Upload Error</h3>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {!file ? (
        <Card
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isLoading}
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs"
          />

          <div className="text-center">
            <Upload
              className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isLoading ? 'Processing file...' : 'Drop your code file here'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse your computer
            </p>
            <p className="text-xs text-gray-500">
              Supported: .js, .jsx, .ts, .tsx, .py, .java, .cpp, .c, .go, .rs (Max 100KB)
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {file.language} • {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
