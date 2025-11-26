'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface SeverityData {
  critical: number;
  warning: number;
  suggestion: number;
  total: number;
}

interface SeverityDistributionProps {
  language?: string;
}

export function SeverityDistribution({ language }: SeverityDistributionProps) {
  const [data, setData] = useState<SeverityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        const days = 90;
        params.set('days', days.toString());
        if (language && language !== 'all') {
          params.set('language', language);
        }

        const response = await fetch(`/api/analytics/trends?${params.toString()}`);
        const result = await response.json();

        if (result.severityDistribution) {
          setData(result.severityDistribution);
        }
      } catch (error) {
        console.error('Failed to fetch severity distribution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language || 'all']);

  if (loading) {
    return (
      <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
        <div className="mb-8">
          <div className="h-8 bg-slate-700/50 rounded-lg w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-700/30 rounded-lg w-32 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-slate-600 border-t-cyan-400 animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading severity data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-100">Issue Severity Distribution</h3>
          <p className="text-slate-400 text-sm mt-1">No issues found</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">No issues to display</p>
          </div>
        </div>
      </div>
    );
  }

  const criticalPercent = Math.round((data.critical / data.total) * 100);
  const warningPercent = Math.round((data.warning / data.total) * 100);
  const suggestionPercent = Math.round((data.suggestion / data.total) * 100);

  // SVG Pie Chart
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  let criticalDashoffset = circumference;
  let warningDashoffset = circumference - (criticalPercent / 100) * circumference;
  let suggestionDashoffset = circumference - ((criticalPercent + warningPercent) / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm hover:border-slate-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/50">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-100">Issue Severity Distribution</h3>
        <p className="text-slate-400 text-sm mt-1">Breakdown of {data.total} total issues</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Pie Chart */}
        <div className="shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90 drop-shadow-lg">
            {/* Background circle */}
            <circle cx="100" cy="100" r={radius} fill="none" stroke="#1e293b" strokeWidth="20" />

            {/* Critical (Red) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (criticalPercent / 100) * circumference}
              strokeLinecap="round"
            />

            {/* Warning (Yellow) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#eab308"
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={warningDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.3s ease',
              }}
            />

            {/* Suggestion (Blue) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={suggestionDashoffset}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="group flex items-center gap-3 p-4 bg-linear-to-r from-red-600/10 to-red-500/5 rounded-xl border border-red-500/30 hover:border-red-500/60 transition-all hover:bg-red-600/15 cursor-pointer">
            <div className="flex items-center gap-2 flex-1">
              <AlertCircle className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
              <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">Critical</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-red-400 group-hover:text-red-300">{data.critical}</div>
              <div className="text-xs text-slate-500">{criticalPercent}%</div>
            </div>
          </div>

          <div className="group flex items-center gap-3 p-4 bg-linear-to-r from-yellow-600/10 to-yellow-500/5 rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 transition-all hover:bg-yellow-600/15 cursor-pointer">
            <div className="flex items-center gap-2 flex-1">
              <AlertTriangle className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
              <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">Warning</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-400 group-hover:text-yellow-300">{data.warning}</div>
              <div className="text-xs text-slate-500">{warningPercent}%</div>
            </div>
          </div>

          <div className="group flex items-center gap-3 p-4 bg-linear-to-r from-blue-600/10 to-blue-500/5 rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition-all hover:bg-blue-600/15 cursor-pointer">
            <div className="flex items-center gap-2 flex-1">
              <Lightbulb className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">Suggestion</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400 group-hover:text-blue-300">{data.suggestion}</div>
              <div className="text-xs text-slate-500">{suggestionPercent}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
