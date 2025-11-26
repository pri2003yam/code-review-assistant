'use client';

import { lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { getMonacoLanguage, getLanguageDisplayName } from '@/lib/utils';
import { ProgrammingLanguage } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.default }))
);

interface CodePreviewProps {
  code: string;
  language: ProgrammingLanguage;
  fileName?: string;
}

function EditorSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
}

export function CodePreview({ code, language, fileName }: CodePreviewProps) {
  const monacoLanguage = getMonacoLanguage(language);
  const languageDisplay = getLanguageDisplayName(language);

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="text-sm font-medium text-gray-700">{languageDisplay}</code>
          {fileName && (
            <span className="text-sm text-gray-500">· {fileName}</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{code.split('\n').length} lines</span>
      </div>
      <Suspense fallback={<EditorSkeleton />}>
        <div className="h-96">
          <MonacoEditor
            height="100%"
            language={monacoLanguage}
            value={code}
            theme="vs-light"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, Courier New, monospace',
            }}
          />
        </div>
      </Suspense>
    </Card>
  );
}
