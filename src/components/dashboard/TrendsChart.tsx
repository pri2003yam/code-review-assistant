'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Filter } from 'lucide-react';

interface TrendDataPoint {
  date: string;
  score: number;
  fileName: string;
}

interface TrendsChartProps {
  language?: string;
}

export function TrendsChart({ language = 'all' }: TrendsChartProps) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(90);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('days', String(days));
        if (language && language !== 'all') {
          params.set('language', language);
        }

        const response = await fetch(`/api/analytics/trends?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.trends);
        }
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [days, language]);

  if (loading) {
    return (
      <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
        <div className="mb-6">
          <div className="h-8 bg-slate-700/50 rounded-lg w-48 mb-2 animate-pulse"></div>
        </div>
        <div className="h-64 bg-slate-700/20 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Code Quality Trends</h2>
        </div>
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">No data available for the selected period.</p>
        </div>
      </div>
    );
  }

  // Find min and max scores for scaling
  const scores = data.map(d => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore || 1;

  // Group by date and calculate average
  const dateMap = new Map<string, number[]>();
  data.forEach(point => {
    const date = new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(point.score);
  });

  const chartData = Array.from(dateMap.entries()).map(([date, scores]) => ({
    date,
    avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  const chartWidth = Math.max(800, chartData.length * 40);
  const chartHeight = 300;
  const padding = 60;

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 bg-linear-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/30 backdrop-blur-sm hover:border-slate-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Code Quality Trends</h2>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 bg-linear-to-r from-slate-700/50 to-slate-600/50 border border-slate-600/50 hover:border-slate-500/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-sm"
          >
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </select>
        </div>
      </div>

      {/* Simple SVG Line Chart */}
        <div className="overflow-x-auto bg-linear-to-b from-slate-900/30 to-slate-800/20 rounded-xl p-6 border border-slate-700/50">
        <svg width={chartWidth} height={chartHeight} className="min-w-full drop-shadow-lg">
          {/* Grid lines */}
          {[0, 2.5, 5, 7.5, 10].map((score) => {
            const y = padding + ((10 - score) / 10) * (chartHeight - 2 * padding);
            return (
              <g key={`grid-${score}`}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#475569"
                  strokeDasharray="4,4"
                  opacity="0.3"
                />
                <text x={padding - 10} y={y + 4} fontSize="12" fill="#94a3b8" textAnchor="end">
                  {score}
                </text>
              </g>
            );
          })}

          {/* Data points and line */}
          <g>
            {/* Line path with gradient effect */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glow line */}
            <polyline
              points={chartData
                .map((point, idx) => {
                  const x = padding + (idx / (chartData.length - 1 || 1)) * (chartWidth - 2 * padding);
                  const y = padding + ((10 - point.avgScore) / 10) * (chartHeight - 2 * padding);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="4"
              opacity="0.2"
              filter="url(#glow)"
            />

            {/* Main line */}
            <polyline
              points={chartData
                .map((point, idx) => {
                  const x = padding + (idx / (chartData.length - 1 || 1)) * (chartWidth - 2 * padding);
                  const y = padding + ((10 - point.avgScore) / 10) * (chartHeight - 2 * padding);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {chartData.map((point, idx) => {
              const x = padding + (idx / (chartData.length - 1 || 1)) * (chartWidth - 2 * padding);
              const y = padding + ((10 - point.avgScore) / 10) * (chartHeight - 2 * padding);
              const isGood = point.avgScore >= 7;
              const color = isGood ? '#10b981' : point.avgScore >= 5 ? '#f59e0b' : '#ef4444';

              return (
                <g key={`point-${idx}`}>
                  <circle cx={x} cy={y} r="5" fill={color} opacity="0.9" />
                  <circle cx={x} cy={y} r="8" fill={color} opacity="0.2" />
                  <text
                    x={x}
                    y={y - 15}
                    fontSize="11"
                    fontWeight="600"
                    fill="#cbd5e1"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {point.avgScore.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* X-axis labels */}
          {chartData.map((point, idx) => {
            if (chartData.length > 15 && idx % Math.ceil(chartData.length / 10) !== 0) return null;
            const x = padding + (idx / (chartData.length - 1 || 1)) * (chartWidth - 2 * padding);
            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={chartHeight - 20}
                fontSize="11"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {point.date}
              </text>
            );
          })}

          {/* Y-axis label */}
          <text x={20} y={30} fontSize="12" fill="#94a3b8" textAnchor="middle">
            Score (0-10)
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 text-sm bg-slate-900/20 p-4 rounded-lg border border-slate-700/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
          <span className="text-slate-300">Good (≥7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></div>
          <span className="text-slate-300">Fair (5-7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
          <span className="text-slate-300">Needs Work (&lt;5)</span>
        </div>
      </div>
    </div>
  );
}
