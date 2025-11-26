'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap } from 'lucide-react';

interface RecurringIssue {
  description: string;
  count: number;
}

interface IssueCategory {
  category: string;
  count: number;
}

interface RecurringIssuesProps {
  language?: string;
  sessionId?: string;
}

export function RecurringIssues({ language = 'all', sessionId }: RecurringIssuesProps) {
  const [issues, setIssues] = useState<RecurringIssue[]>([]);
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('days', '90');
        if (sessionId) {
          params.set('sessionId', sessionId);
        }
        if (language && language !== 'all') {
          params.set('language', language);
        }

        const response = await fetch(`/api/analytics/trends?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setIssues(result.topIssues);
          setCategories(result.topCategories);
        }
      } catch (error) {
        console.error('Failed to fetch recurring issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [language]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
          <div className="mb-6">
            <div className="h-8 bg-slate-700/50 rounded-lg w-48 mb-2 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-slate-700/30 rounded-lg w-3/4 animate-pulse"></div>
                <div className="h-2 bg-slate-700/20 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
          <div className="mb-6">
            <div className="h-8 bg-slate-700/50 rounded-lg w-48 mb-2 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-slate-700/30 rounded-lg w-3/4 animate-pulse"></div>
                <div className="h-2 bg-slate-700/20 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Recurring Issues */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm hover:border-slate-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/50">
        <div className="flex items-center gap-3 mb-8">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Top Recurring Issues</h2>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">No issues found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue, idx) => {
              const maxCount = Math.max(...issues.map(i => i.count));
              const percentage = (issue.count / maxCount) * 100;
              return (
                <div key={idx} className="group p-4 rounded-xl bg-linear-to-r from-red-600/10 to-red-500/5 border border-red-500/20 hover:border-red-500/50 hover:bg-red-600/15 transition-all cursor-pointer space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-300 line-clamp-2 flex-1 group-hover:text-slate-100 transition-colors">
                      {issue.description}
                    </p>
                    <Badge className="bg-red-600/30 text-red-300 hover:bg-red-600/50 text-xs shrink-0 border border-red-500/30">
                      {issue.count}x
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                    <div
                      className="bg-linear-to-r from-red-500 via-red-400 to-red-600 h-full rounded-full shadow-lg shadow-red-500/50 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-linear-to-r from-red-600/10 to-red-500/5 border border-red-500/30 rounded-xl hover:border-red-500/60 transition-all">
          <p className="text-sm text-red-200">
            💡 <strong>Quick Tip:</strong> Focus on fixing these recurring issues to significantly improve overall code quality and maintainability.
          </p>
        </div>
      </div>

      {/* Issue Categories */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm hover:border-slate-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/50">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Issue Breakdown by Category</h2>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">No data available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat, idx) => {
              const maxCount = Math.max(...categories.map(c => c.count));
              const percentage = (cat.count / maxCount) * 100;
              
              const categoryColors: Record<string, { bg: string; borderColor: string; text: string; gradient: string; glow: string }> = {
                'bug': { bg: 'from-red-600/10 to-red-500/5', borderColor: 'border-red-500/30', text: 'text-red-200', gradient: 'from-red-500 via-red-400 to-red-600', glow: 'shadow-red-500/50' },
                'performance': { bg: 'from-yellow-600/10 to-yellow-500/5', borderColor: 'border-yellow-500/30', text: 'text-yellow-200', gradient: 'from-yellow-500 via-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/50' },
                'readability': { bg: 'from-blue-600/10 to-blue-500/5', borderColor: 'border-blue-500/30', text: 'text-blue-200', gradient: 'from-blue-500 via-blue-400 to-blue-600', glow: 'shadow-blue-500/50' },
                'security': { bg: 'from-purple-600/10 to-purple-500/5', borderColor: 'border-purple-500/30', text: 'text-purple-200', gradient: 'from-purple-500 via-purple-400 to-purple-600', glow: 'shadow-purple-500/50' },
                'modularity': { bg: 'from-green-600/10 to-green-500/5', borderColor: 'border-green-500/30', text: 'text-green-200', gradient: 'from-green-500 via-green-400 to-green-600', glow: 'shadow-green-500/50' },
                'best-practice': { bg: 'from-cyan-600/10 to-cyan-500/5', borderColor: 'border-cyan-500/30', text: 'text-cyan-200', gradient: 'from-cyan-500 via-cyan-400 to-cyan-600', glow: 'shadow-cyan-500/50' },
              };

              const colors = categoryColors[cat.category] || { bg: 'from-slate-700/10 to-slate-600/5', borderColor: 'border-slate-500/30', text: 'text-slate-200', gradient: 'from-slate-500 via-slate-400 to-slate-600', glow: 'shadow-slate-500/50' };

              return (
                <div key={idx} className={`group p-4 rounded-xl bg-linear-to-r ${colors.bg} ${colors.borderColor} hover:${colors.borderColor.replace('30', '60')} border transition-all space-y-2 cursor-pointer`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm capitalize ${colors.text} group-hover:brightness-110 transition-all`}>
                      {cat.category}
                    </span>
                    <Badge className={`bg-${colors.text.split('-')[1]}-600/30 ${colors.text} hover:brightness-110 text-xs border ${colors.borderColor}`}>
                      {cat.count}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                    <div
                      className={`bg-linear-to-r ${colors.gradient} h-full rounded-full shadow-lg ${colors.glow} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
