'use client';

import { useSessionInfo } from '@/hooks/useSessionInfo';
import { ReportsList } from './ReportsList';
import { StatsOverview } from './StatsOverview';
import { TrendsChart } from './TrendsChart';
import { RecurringIssues } from './RecurringIssues';
import { SeverityDistribution } from './SeverityDistribution';
import { AnalysisTimeTrend } from './AnalysisTimeTrend';
import { CodeComplexityTracker } from './CodeComplexityTracker';
import { LanguageComparison } from './LanguageComparison';
import { CategoryDeepDive } from './CategoryDeepDive';
import { SmartRecommendations } from './SmartRecommendations';
import Link from 'next/link';
import { Code2, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Report } from '@/types';

export function DashboardContent() {
  const { sessionId, isLoading: sessionLoading } = useSessionInfo();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch reports for this session
        const reportsRes = await fetch(
          `/api/reports?sessionId=${sessionId}&page=${page}&limit=10`,
          { cache: 'no-store' }
        );
        const reportsData = await reportsRes.json();

        if (reportsData.success) {
          setReports(reportsData.reports || []);
          setTotal(reportsData.total || 0);
        }

        // Fetch stats for this session
        const statsRes = await fetch(
          `/api/reports/stats?sessionId=${sessionId}`,
          { cache: 'no-store' }
        );
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId, page]);

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionId) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="bg-linear-to-br from-red-900/20 to-red-800/20 border border-red-700/50 rounded-xl p-8 backdrop-blur">
            <h1 className="text-2xl font-bold text-red-300 mb-4">
              Error Loading Dashboard
            </h1>
            <p className="text-red-200/80 mb-6">
              {error || 'Unable to load session data. Please refresh the page.'}
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-400 via-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/50 transition-all">
              <Code2 className="w-6 h-6 text-white font-bold" />
            </div>
            <div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500">
                CodeReview AI
              </span>
              <p className="text-xs text-slate-400">Smart Code Analysis Platform</p>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 text-cyan-300 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-500/60 font-medium shadow-lg hover:shadow-xl hover:shadow-cyan-500/20">
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-6 mb-8">
          <div className="space-y-3">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-cyan-300 to-blue-400">
              Dashboard
            </h1>
            <p className="text-slate-300 text-lg">
              Device-based code review analytics and insights
            </p>
          </div>
        </div>

        <div className="mb-12">
          <StatsOverview stats={stats} />
        </div>

        {/* Performance & Metrics Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-linear-to-b from-blue-400 to-cyan-400 rounded-full"></div>
            <h2 className="text-3xl font-bold text-slate-100">Performance & Metrics</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeverityDistribution />
            <AnalysisTimeTrend />
          </div>
          <CodeComplexityTracker />
        </div>

        {/* Trends & Patterns Section */}
        <div className="space-y-6 mt-12 pt-8 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-linear-to-b from-cyan-400 to-emerald-400 rounded-full"></div>
            <h2 className="text-3xl font-bold text-slate-100">Trends & Patterns</h2>
          </div>
          <div className="space-y-6">
            <TrendsChart />
            <RecurringIssues />
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="space-y-6 mt-12 pt-8 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-linear-to-b from-emerald-400 to-purple-400 rounded-full"></div>
            <h2 className="text-3xl font-bold text-slate-100">Advanced Insights</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LanguageComparison days={90} />
            <CategoryDeepDive days={90} />
          </div>
          <SmartRecommendations days={90} />
        </div>

        {/* Recent Reviews Section */}
        <div className="mt-12 pt-8 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-linear-to-b from-purple-400 to-pink-400 rounded-full"></div>
            <h2 className="text-3xl font-bold text-slate-100">Recent Reviews</h2>
          </div>
          <div className="bg-linear-to-br from-slate-800/60 to-slate-700/60 rounded-2xl p-8 border border-slate-600/30 backdrop-blur-sm hover:border-slate-500/50 transition-all shadow-xl">
            <ReportsList
              initialReports={reports as any}
              initialTotal={total}
              initialPage={page}
              initialTotalPages={Math.ceil(total / 10)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
