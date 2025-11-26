import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel } from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const sessionId = searchParams.get('sessionId');

    // Build filter - same as reports endpoint
    const filter: Record<string, any> = {};

    // Filter by sessionId (required for device-based isolation)
    if (sessionId) {
      filter.sessionId = sessionId;
    }
    
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

    // Get all reports matching the filter (no pagination)
    const allReports = await ReportModel.find(filter).lean();

    // Calculate stats
    const totalReviews = allReports.length;
    const averageScore = totalReviews > 0
      ? allReports.reduce((sum, r) => sum + r.review.overallScore, 0) / totalReviews
      : 0;

    // Count issues by category
    const allIssues = allReports.flatMap((r) => r.review.issues);
    const categoryCount = allIssues.reduce(
      (acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommonCategory = Object.entries(categoryCount).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0]?.[0] || 'N/A';

    // Count this week
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisWeekCount = allReports.filter(
      (r) => r.createdAt && new Date(r.createdAt) > thisWeekStart
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalReviews,
        averageScore: parseFloat(averageScore.toFixed(1)),
        mostCommonCategory,
        thisWeekCount,
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
