'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Code2, TrendingUp, TrendingDown } from 'lucide-react';

interface ComplexityMetrics {
  avgLinesOfCode: number;
  minLinesOfCode: number;
  maxLinesOfCode: number;
  avgAnalysisTime: number;
}

interface CodeComplexityTrackerProps {
  language?: string;
  sessionId?: string;
}

export function CodeComplexityTracker({ language, sessionId }: CodeComplexityTrackerProps) {
  const [metrics, setMetrics] = useState<ComplexityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        const days = 90;
        params.set('days', days.toString());
        if (sessionId) {
          params.set('sessionId', sessionId);
        }
        if (language && language !== 'all') {
          params.set('language', language);
        }

        const response = await fetch(`/api/analytics/trends?${params.toString()}`);
        const result = await response.json();

        if (result.complexityMetrics) {
          setMetrics(result.complexityMetrics);
        }
      } catch (error) {
        console.error('Failed to fetch code complexity metrics:', error);
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
          <div className="h-4 bg-slate-700/30 rounded-lg w-56 animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-700/30 rounded-lg w-32 animate-pulse"></div>
              <div className="h-3 bg-slate-700/20 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold text-slate-100">Code Complexity Tracker</h3>
              <p className="text-slate-400 text-sm mt-1">Lines of code analysis (last 90 days)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">No complexity data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Normalize metrics for bar display
  const maxLOC = metrics.maxLinesOfCode || 1;

  const avgPercent = (metrics.avgLinesOfCode / maxLOC) * 100;
  const minPercent = (metrics.minLinesOfCode / maxLOC) * 100;
  const maxPercent = 100; // Always at max

  // Complexity level determination
  const getComplexityLevel = (loc: number) => {
    if (loc < 100) return { level: 'Very Low', color: '#10b981', bg: 'bg-emerald-900' };
    if (loc < 300) return { level: 'Low', color: '#3b82f6', bg: 'bg-blue-900' };
    if (loc < 600) return { level: 'Medium', color: '#eab308', bg: 'bg-yellow-900' };
    if (loc < 1000) return { level: 'High', color: '#f97316', bg: 'bg-orange-900' };
    return { level: 'Very High', color: '#ef4444', bg: 'bg-red-900' };
  };

  const avgComplexity = getComplexityLevel(metrics.avgLinesOfCode);
  const minComplexity = getComplexityLevel(metrics.minLinesOfCode);
  const maxComplexity = getComplexityLevel(metrics.maxLinesOfCode);

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm hover:border-slate-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/50">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-2xl font-bold text-slate-100">Code Complexity Tracker</h3>
            <p className="text-slate-400 text-sm mt-1">Lines of code analysis (last 90 days)</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Average LOC */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Average</h4>
              <p className="text-xs text-slate-500 mt-1">{avgComplexity.level}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-300">{Math.round(metrics.avgLinesOfCode)}</div>
              <p className="text-xs text-slate-500">lines of code</p>
            </div>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500 shadow-lg shadow-cyan-500/50 transition-all duration-500`}
              style={{ width: `${avgPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Min LOC */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Minimum</h4>
              <p className="text-xs text-slate-500 mt-1">{minComplexity.level}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-300">{Math.round(metrics.minLinesOfCode)}</div>
              <p className="text-xs text-slate-500">lines of code</p>
            </div>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 shadow-lg shadow-emerald-500/50 transition-all duration-500`}
              style={{ width: `${minPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Max LOC */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Maximum</h4>
              <p className="text-xs text-slate-500 mt-1">{maxComplexity.level}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-300">{Math.round(metrics.maxLinesOfCode)}</div>
              <p className="text-xs text-slate-500">lines of code</p>
            </div>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full bg-linear-to-r from-orange-500 via-red-500 to-orange-500 shadow-lg shadow-orange-500/50 transition-all duration-500`}
              style={{ width: `${maxPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Complexity Level Guide */}
        <div className="pt-6 border-t border-slate-700/50">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Complexity Level Guide</h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
              <span className="text-slate-300">Very Low: &lt;100 lines</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
              <span className="text-slate-300">Low: 100-300 lines</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-600/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
              <span className="text-slate-300">Medium: 300-600 lines</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-600/10 border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
              <span className="text-slate-300">High: 600-1000 lines</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-red-600/10 border border-red-500/20 hover:border-red-500/40 transition-all">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
              <span className="text-slate-300">Very High: &gt;1000 lines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
