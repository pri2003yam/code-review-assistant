import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel } from '@/models/Report';
import { ReviewCard } from '@/components/review/ReviewCard';
import { CodeHighlight } from '@/components/review/CodeHighlight';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Code2, Zap } from 'lucide-react';
import Link from 'next/link';
import mongoose from 'mongoose';
import { formatDate } from '@/lib/utils';

interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  { params }: ReportPageProps
): Promise<Metadata> {
  try {
    const { id } = await params;
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        title: 'Report Not Found',
      };
    }

    const report = await ReportModel.findById(id).lean();

    if (!report) {
      return {
        title: 'Report Not Found',
      };
    }

    return {
      title: `${report.fileName} - CodeReview AI`,
      description: `Code review for ${report.fileName} - Score: ${report.review.overallScore}/10`,
    };
  } catch (error) {
    return {
      title: 'Report - CodeReview AI',
    };
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      notFound();
    }

    const report = await ReportModel.findById(id).lean();

    if (!report) {
      notFound();
    }

    // Ensure all required fields exist and handle serialization
    const reportData = {
      ...report,
      _id: report._id?.toString(),
      createdAt: report.createdAt ? new Date(report.createdAt).toISOString() : new Date().toISOString(),
      review: {
        ...report.review,
        issues: (report.review?.issues || []).map((issue: any) => ({
          severity: issue.severity || 'suggestion',
          category: issue.category || 'readability',
          line: issue.line,
          description: issue.description || '',
          suggestion: issue.suggestion || '',
          codeSnippet: issue.codeSnippet,
        })),
        improvements: report.review?.improvements || [],
        positives: report.review?.positives || [],
        overallScore: report.review?.overallScore || 0,
        summary: report.review?.summary || '',
      },
      metadata: {
        ...report.metadata,
        linesOfCode: report.metadata?.linesOfCode || 0,
        analysisTime: report.metadata?.analysisTime || 0,
        model: report.metadata?.model || 'unknown',
      },
    } as any;

    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-linear-to-r from-slate-900/95 to-slate-800/95 backdrop-blur border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 mb-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* File Info Header */}
          <div className="mb-8 bg-linear-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {reportData.fileName}
                </h1>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(reportData.createdAt || new Date())}
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {reportData.review.overallScore}
                </div>
                <div className="text-sm text-slate-400">/ 10 Score</div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700">
              <div className="text-center">
                <div className="text-red-400 font-semibold text-lg">
                  {reportData.review.issues.filter((i: any) => i.severity === 'critical').length}
                </div>
                <div className="text-xs text-slate-400">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold text-lg">
                  {reportData.review.issues.filter((i: any) => i.severity === 'warning').length}
                </div>
                <div className="text-xs text-slate-400">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold text-lg">
                  {reportData.review.issues.filter((i: any) => i.severity === 'suggestion').length}
                </div>
                <div className="text-xs text-slate-400">Suggestions</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-semibold text-lg">
                  {reportData.metadata.linesOfCode}
                </div>
                <div className="text-xs text-slate-400">Lines of Code</div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Code */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Summary
                  </h2>
                  <p className="text-slate-300 leading-relaxed">
                    {reportData.review.summary}
                  </p>
                </div>

                {/* Code with Highlighting */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                    Source Code
                  </h2>
                  <CodeHighlight
                    code={reportData.originalCode}
                    language={reportData.language}
                    highlightLines={reportData.review.issues
                      .filter((i: any) => i.line)
                      .map((i: any) => i.line!)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Review Card */}
            <div>
              <div className="sticky top-24">
                <ReviewCard report={reportData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Report page error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="bg-linear-to-br from-red-900/20 to-red-800/20 border border-red-700/50 rounded-xl p-8 backdrop-blur">
            <h1 className="text-2xl font-bold text-red-300 mb-4">
              Error Loading Report
            </h1>
            <p className="text-red-200/80 mb-6">
              There was an error loading this report. The report data may be corrupted or missing.
            </p>
            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
