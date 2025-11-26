'use client';

import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalReviews: number;
    averageScore: number;
    mostCommonCategory: string;
    thisWeekCount: number;
  } | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) {
    return null;
  }

  const statsList = [
    {
      icon: BarChart3,
      label: 'Total Reviews',
      value: stats.totalReviews,
      gradient: 'from-blue-600/20 to-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: stats.averageScore.toFixed(1),
      gradient: 'from-emerald-600/20 to-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      icon: AlertCircle,
      label: 'Top Issue Type',
      value: stats.mostCommonCategory,
      gradient: 'from-amber-600/20 to-amber-500/10',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      icon: CheckCircle,
      label: 'This Week',
      value: stats.thisWeekCount,
      gradient: 'from-purple-600/20 to-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statsList.map((stat, idx) => (
        <div
          key={idx}
          className={`group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} backdrop-blur-sm hover:border-opacity-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 hover:scale-105 transform`}
        >
          {/* Animated background accent */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-2xl opacity-30" style={{ background: stat.iconColor }}></div>
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-100 mt-3">{stat.value}</p>
            </div>
            <div className={`${stat.iconColor} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
              <stat.icon className="w-10 h-10" />
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{
            backgroundImage: `linear-gradient(to right, var(--color-start), var(--color-end))`,
            '--color-start': stat.iconColor,
            '--color-end': 'transparent',
          } as React.CSSProperties}></div>
        </div>
      ))}
    </div>
  );
}
