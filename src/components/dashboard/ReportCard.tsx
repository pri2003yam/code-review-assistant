'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Report, IssueSeverity } from '@/types';
import { formatDate, getLanguageDisplayName } from '@/lib/utils';
import { Trash2, Eye, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onDelete?: (id: string) => void;
}

export function ReportCard({ report, onDelete }: ReportCardProps) {
  const criticalCount = report.review.issues.filter(
    (i) => i.severity === IssueSeverity.CRITICAL
  ).length;
  const warningCount = report.review.issues.filter(
    (i) => i.severity === IssueSeverity.WARNING
  ).length;
  const suggestionCount = report.review.issues.filter(
    (i) => i.severity === IssueSeverity.SUGGESTION
  ).length;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400 bg-green-500/10 border border-green-500/30';
    if (score >= 6) return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border border-red-500/30';
  };

  const getLanguageBadgeColor = (lang: string) => {
    const colors: Record<string, string> = {
      'javascript': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'typescript': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'python': 'bg-green-500/20 text-green-300 border-green-500/30',
      'cpp': 'bg-red-500/20 text-red-300 border-red-500/30',
      'java': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'go': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'rust': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    };
    return colors[lang] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl p-6 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 hover:border-slate-500/60 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm hover:scale-105 transform">
      {/* Gradient accent */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-blue-500"></div>
      
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-100 truncate group-hover:text-blue-300 transition-colors">{report.fileName}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {formatDate(report.createdAt || new Date())}
            </p>
          </div>
          <div className={`text-3xl font-black rounded-xl px-4 py-2 whitespace-nowrap transition-all ${getScoreColor(report.review.overallScore)}`}>
            {report.review.overallScore}
          </div>
        </div>

        {/* Language Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getLanguageBadgeColor(report.language)} shadow-lg`}>
            {getLanguageDisplayName(report.language)}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-2 text-xs">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-red-600/20 to-red-500/10 border border-red-500/40 rounded-lg text-red-300 font-semibold shadow-lg shadow-red-500/20">
              <AlertCircle className="w-4 h-4" />
              <span>{criticalCount} Critical</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-yellow-600/20 to-yellow-500/10 border border-yellow-500/40 rounded-lg text-yellow-300 font-semibold shadow-lg shadow-yellow-500/20">
              <AlertTriangle className="w-4 h-4" />
              <span>{warningCount} Warning</span>
            </div>
          )}
          {suggestionCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-cyan-600/20 to-cyan-500/10 border border-cyan-500/40 rounded-lg text-cyan-300 font-semibold shadow-lg shadow-cyan-500/20">
              <Lightbulb className="w-4 h-4" />
              <span>{suggestionCount} Suggestion</span>
            </div>
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-300 line-clamp-2 group-hover:text-slate-200 transition-colors">
          {report.review.summary}
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-700/50">
          <Link href={`/review/${report._id}`} className="flex-1">
            <button className="w-full gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg transition-all hover:shadow-xl hover:shadow-blue-500/50 flex items-center justify-center group/btn">
              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              View Full Report
            </button>
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(report._id!)}
              className="px-4 py-3 bg-linear-to-r from-slate-700/50 to-slate-600/50 hover:from-red-600/30 hover:to-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all border border-slate-600/50 hover:border-red-500/50 shadow-lg hover:shadow-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
