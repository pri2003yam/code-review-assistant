import { Metadata } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel } from '@/models/Report';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ReportsList } from '@/components/dashboard/ReportsList';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { RecurringIssues } from '@/components/dashboard/RecurringIssues';
import { SeverityDistribution } from '@/components/dashboard/SeverityDistribution';
import { AnalysisTimeTrend } from '@/components/dashboard/AnalysisTimeTrend';
import { CodeComplexityTracker } from '@/components/dashboard/CodeComplexityTracker';
import { LanguageComparison } from '@/components/dashboard/LanguageComparison';
import { CategoryDeepDive } from '@/components/dashboard/CategoryDeepDive';
import { SmartRecommendations } from '@/components/dashboard/SmartRecommendations';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Code2, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard - CodeReview AI',
  description: 'View your code review history and statistics',
};

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  try {
    await connectToDatabase();

    const params = await searchParams;
    const pageParam = params.page as string | undefined;
    const limitParam = params.limit as string | undefined;
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const language = params.language as string | undefined;
    const severity = params.severity as string | undefined;
    const search = params.search as string | undefined;
    const sortBy = params.sortBy as string | undefined;
    const minScore = params.minScore as string | undefined;
    const maxScore = params.maxScore as string | undefined;

    // Build query string for stats API
    const statsParams = new URLSearchParams();
    if (language && language !== 'all') statsParams.set('language', language);
    if (severity && severity !== 'all') statsParams.set('severity', severity);
    if (search) statsParams.set('search', search);
    if (minScore) statsParams.set('minScore', minScore);
    if (maxScore) statsParams.set('maxScore', maxScore);

    // Fetch aggregate stats
    let aggregateStats = null;
    try {
      const statsRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reports/stats?${statsParams.toString()}`,
        { cache: 'no-store' }
      );
      const statsData = await statsRes.json();
      aggregateStats = statsData.stats;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }

    const filter: Record<string, any> = {};
    if (language && language !== 'all') {
      filter.language = language;
    }

    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { 'review.summary': { $regex: search, $options: 'i' } },
        { 'review.issues.description': { $regex: search, $options: 'i' } },
      ];
    }

    if (severity && severity !== 'all') {
      filter['review.issues.severity'] = severity;
    }

    if (minScore || maxScore) {
      filter['review.overallScore'] = {};
      if (minScore) {
        filter['review.overallScore'].$gte = parseFloat(minScore);
      }
      if (maxScore) {
        filter['review.overallScore'].$lte = parseFloat(maxScore);
      }
    }

    const skip = (page - 1) * limit;
    
    let sortOrder: Record<string, any> = { createdAt: -1 };
    if (sortBy === 'score') {
      sortOrder = { 'review.overallScore': -1, createdAt: -1 };
    } else if (sortBy === 'issues') {
      sortOrder = { 'review.issues': -1, createdAt: -1 };
    }

    const total = await ReportModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const reports = await ReportModel.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .lean();

    const reportsWithIds = reports.map((report) => ({
      ...report,
      _id: report._id?.toString(),
    }));

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
                Real-time code review analytics and insights
              </p>
            </div>
          </div>

          <div className="mb-12">
            <StatsOverview stats={aggregateStats} />
          </div>

          {/* Performance & Metrics Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-linear-to-b from-blue-400 to-cyan-400 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-100">Performance & Metrics</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SeverityDistribution language={language} />
              <AnalysisTimeTrend language={language} />
            </div>
            <CodeComplexityTracker language={language} />
          </div>

          {/* Trends & Patterns Section */}
          <div className="space-y-6 mt-12 pt-8 border-t border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-linear-to-b from-cyan-400 to-emerald-400 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-100">Trends & Patterns</h2>
            </div>
            <div className="space-y-6">
              <TrendsChart language={language} />
              <RecurringIssues language={language} />
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
                initialReports={reportsWithIds as any}
                initialTotal={total}
                initialPage={page}
                initialTotalPages={totalPages}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="bg-linear-to-br from-red-900/20 to-red-800/20 border border-red-700/50 rounded-xl p-8 backdrop-blur">
            <h1 className="text-2xl font-bold text-red-300 mb-4">
              Error Loading Dashboard
            </h1>
            <p className="text-red-200/80 mb-4">
              Unable to connect to the database. This could be due to:
            </p>
            <ul className="text-red-200/70 text-left space-y-2 mb-6">
              <li>• MongoDB Atlas IP whitelist not configured</li>
              <li>• Database connection string is incorrect</li>
              <li>• Network connectivity issues</li>
            </ul>
            <p className="text-slate-300 text-sm mb-6">
              Your recent code review is available on the home page.
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
}
