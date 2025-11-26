import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel } from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '90');

    // Filter by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const filter = { createdAt: { $gte: startDate } };

    // Get all reports matching the filter
    const allReports = await ReportModel.find(filter).lean();

    // Group by language
    const languageStats = new Map<string, any>();

    allReports.forEach((report: any) => {
      const lang = report.language || 'unknown';
      
      if (!languageStats.has(lang)) {
        languageStats.set(lang, {
          language: lang,
          count: 0,
          scores: [],
          issues: [],
          avgScore: 0,
          criticalCount: 0,
          warningCount: 0,
          suggestionCount: 0,
        });
      }

      const stats = languageStats.get(lang);
      stats.count += 1;
      stats.scores.push(report.review.overallScore);

      // Count issues by severity
      report.review.issues?.forEach((issue: any) => {
        stats.issues.push(issue);
        if (issue.severity === 'critical') stats.criticalCount += 1;
        else if (issue.severity === 'warning') stats.warningCount += 1;
        else if (issue.severity === 'suggestion') stats.suggestionCount += 1;
      });
    });

    // Calculate averages and prepare response
    const languages = Array.from(languageStats.values())
      .map((stats: any) => ({
        language: stats.language,
        count: stats.count,
        avgScore: stats.scores.length > 0 ? Math.round((stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length) * 10) / 10 : 0,
        minScore: stats.scores.length > 0 ? Math.min(...stats.scores) : 0,
        maxScore: stats.scores.length > 0 ? Math.max(...stats.scores) : 0,
        totalIssues: stats.issues.length,
        avgIssuesPerReview: stats.count > 0 ? Math.round((stats.issues.length / stats.count) * 10) / 10 : 0,
        criticalCount: stats.criticalCount,
        warningCount: stats.warningCount,
        suggestionCount: stats.suggestionCount,
        trend: stats.scores.length >= 2 
          ? stats.scores[stats.scores.length - 1] - stats.scores[0]
          : 0,
      }))
      .sort((a: any, b: any) => b.avgScore - a.avgScore);

    return NextResponse.json({
      success: true,
      languages,
      totalLanguages: languages.length,
      bestLanguage: languages[0]?.language || 'N/A',
      bestScore: languages[0]?.avgScore || 0,
    });
  } catch (error) {
    console.error('Language comparison fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch language comparison' },
      { status: 500 }
    );
  }
}
