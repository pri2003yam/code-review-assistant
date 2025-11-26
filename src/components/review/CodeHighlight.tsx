'use client';

interface CodeHighlightProps {
  code: string;
  language: string;
  highlightLines?: number[];
}

export function CodeHighlight({ code, language, highlightLines = [] }: CodeHighlightProps) {
  const lines = code.split('\n');

  return (
    <div className="relative rounded-lg bg-gray-900 overflow-hidden border border-slate-700">
      {/* Line numbers and code */}
      <pre className="overflow-x-auto p-4">
        <code className={`language-${language || 'plaintext'}`}>
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${
                highlightLines.includes(idx + 1)
                  ? 'bg-yellow-900/30 border-l-2 border-yellow-400 pl-2'
                  : ''
              }`}
            >
              <span className="select-none text-gray-500 min-w-8 text-right">
                {idx + 1}
              </span>
              <span className="flex-1 text-slate-300 font-mono text-sm">{line || ' '}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
