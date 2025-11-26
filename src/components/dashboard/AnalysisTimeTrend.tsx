'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, TrendingUp } from 'lucide-react';

interface TrendPoint {
  date: string;
  analysisTime: number;
  score: number;
}

interface AnalysisTimeMetrics {
  avgAnalysisTime: number;
  minAnalysisTime: number;
  maxAnalysisTime: number;
}

interface AnalysisTimeTrendProps {
  language?: string;
  sessionId?: string;
}

export function AnalysisTimeTrend({ language, sessionId }: AnalysisTimeTrendProps) {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [metrics, setMetrics] = useState<AnalysisTimeMetrics | null>(null);
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

        if (result.trends && result.complexityMetrics) {
          setTrends(result.trends);
          setMetrics(result.complexityMetrics);
        }
      } catch (error) {
        console.error('Failed to fetch analysis time trend:', error);
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
          <div className="h-4 bg-slate-700/30 rounded-lg w-64 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-slate-700/20 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-700/20 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0 || !metrics) {
    return (
      <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            <h3 className="text-2xl font-bold text-slate-100">Analysis Time Trend</h3>
          </div>
          <p className="text-slate-400 text-sm mt-1">No data available</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">No analysis data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate max for scaling
  const maxTime = Math.max(...trends.map(t => t.analysisTime), metrics.maxAnalysisTime);
  const padding = 40;
  const width = 600;
  const height = 300;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Scale functions
  const scaleX = (index: number) => (index / (trends.length - 1 || 1)) * chartWidth + padding;
  const scaleY = (value: number) => height - padding - (value / maxTime) * chartHeight;

  // Generate path for line chart
  const pathData = trends
    .map((point, i) => {
      const x = scaleX(i);
      const y = scaleY(point.analysisTime);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm hover:border-slate-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/50">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="text-2xl font-bold text-slate-100">Analysis Time Trend</h3>
            <p className="text-slate-400 text-sm mt-1">AI processing time across {trends.length} reviews (last 90 days)</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Line Chart */}
        <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-6 border border-slate-700/50 overflow-x-auto">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="min-w-full drop-shadow-lg">
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Grid background */}
            <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="url(#grid)" />

            {/* Average line */}
            <line
              x1={padding}
              y1={scaleY(metrics.avgAnalysisTime)}
              x2={width - padding}
              y2={scaleY(metrics.avgAnalysisTime)}
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />

            {/* Line chart */}
            <path d={pathData} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {trends.map((point, i) => (
              <circle
                key={i}
                cx={scaleX(i)}
                cy={scaleY(point.analysisTime)}
                r="4"
                fill={point.analysisTime > metrics.avgAnalysisTime ? '#f59e0b' : '#10b981'}
                opacity="0.8"
              />
            ))}

            {/* Y-axis labels */}
            <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="12" fill="#94a3b8">
              {(maxTime / 1000).toFixed(1)}s
            </text>
            <text
              x={padding - 10}
              y={padding + chartHeight / 2 + 5}
              textAnchor="end"
              fontSize="12"
              fill="#94a3b8"
            >
              {(maxTime / 2000).toFixed(1)}s
            </text>
            <text
              x={padding - 10}
              y={height - padding + 5}
              textAnchor="end"
              fontSize="12"
              fill="#94a3b8"
            >
              0s
            </text>

            {/* Axes */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="2" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="2" />
          </svg>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="group p-6 bg-linear-to-br from-cyan-600/10 to-cyan-500/5 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:bg-cyan-600/15">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">Average Time</div>
            <div className="text-2xl font-bold text-cyan-300">{(metrics.avgAnalysisTime / 1000).toFixed(1)}s</div>
          </div>
          <div className="group p-6 bg-linear-to-br from-emerald-600/10 to-emerald-500/5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all hover:bg-emerald-600/15">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Minimum Time</div>
            <div className="text-2xl font-bold text-emerald-300">{(metrics.minAnalysisTime / 1000).toFixed(1)}s</div>
          </div>
          <div className="group p-6 bg-linear-to-br from-orange-600/10 to-orange-500/5 rounded-xl border border-orange-500/30 hover:border-orange-500/60 transition-all hover:bg-orange-600/15">
            <div className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">Maximum Time</div>
            <div className="text-2xl font-bold text-orange-300">{(metrics.maxAnalysisTime / 1000).toFixed(1)}s</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 bg-slate-900/20 p-4 rounded-lg border border-slate-700/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Below Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Above Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-cyan-500" style={{ opacity: 0.5 }}></div>
            <span>Average Line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
