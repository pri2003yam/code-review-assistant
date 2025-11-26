'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewIssue, IssueSeverity } from '@/types';
import { CheckCircle2, AlertCircle, MessageSquare, Trash2 } from 'lucide-react';

interface IssueItemWithResolutionProps {
  issue: ReviewIssue;
  index: number;
  onToggleResolved?: (index: number) => void;
  onDeleteIssue?: (index: number) => void;
}

export function IssueItemWithResolution({
  issue,
  index,
  onToggleResolved,
  onDeleteIssue,
}: IssueItemWithResolutionProps) {
  const [isResolved, setIsResolved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const handleResolve = () => {
    setIsResolved(!isResolved);
    onToggleResolved?.(index);
  };

  const getSeverityColor = () => {
    switch (issue.severity) {
      case IssueSeverity.CRITICAL:
        return 'bg-red-50 border-red-200';
      case IssueSeverity.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      case IssueSeverity.SUGGESTION:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadgeColor = () => {
    switch (issue.severity) {
      case IssueSeverity.CRITICAL:
        return 'bg-red-100 text-red-800';
      case IssueSeverity.WARNING:
        return 'bg-yellow-100 text-yellow-800';
      case IssueSeverity.SUGGESTION:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      className={`border-2 p-4 transition-all ${getSeverityColor()} ${
        isResolved ? 'opacity-60' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Header with severity and line number */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getSeverityBadgeColor()}>
                {issue.severity}
              </Badge>
              {issue.line && (
                <Badge variant="outline" className="text-xs">
                  Line {issue.line}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {issue.category}
              </Badge>
            </div>
            <p className={`font-semibold ${isResolved ? 'line-through text-gray-500' : ''}`}>
              {issue.description}
            </p>
          </div>
          <Button
            size="sm"
            variant={isResolved ? 'default' : 'outline'}
            onClick={handleResolve}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isResolved ? 'Resolved' : 'Resolve'}
          </Button>
        </div>

        {/* Suggestion */}
        <div className="bg-white/50 rounded p-3 border-l-2 border-green-500">
          <p className="text-sm text-gray-700">
            <strong className="text-green-700">Suggestion:</strong> {issue.suggestion}
          </p>
        </div>

        {/* Code snippet if available */}
        {issue.codeSnippet && (
          <div className="bg-gray-900 rounded p-3 overflow-x-auto">
            <code className="text-xs text-gray-100 font-mono">
              {issue.codeSnippet}
            </code>
          </div>
        )}

        {/* Notes section */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNotes(!showNotes)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Notes
          </Button>
          {onDeleteIssue && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeleteIssue(index)}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this issue..."
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        )}
      </div>
    </Card>
  );
}
