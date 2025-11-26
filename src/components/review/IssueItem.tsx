'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from './SeverityBadge';
import { ReviewIssue } from '@/types';
import { getCategoryColor } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface IssueItemProps {
  issue: ReviewIssue;
}

export function IssueItem({ issue }: IssueItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4 mb-3 hover:shadow-md transition-shadow">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={issue.severity} />
            <Badge className={`${getCategoryColor(issue.category)}`}>
              {issue.category}
            </Badge>
            {issue.line && (
              <span className="text-sm text-gray-500 ml-auto">Line {issue.line}</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{issue.description}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Suggestion:</h4>
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
              {issue.suggestion}
            </p>
          </div>

          {issue.codeSnippet && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Suggested Code:
              </h4>
              <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                <code>{issue.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
