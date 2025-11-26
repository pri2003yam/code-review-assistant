import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel } from '@/models/Report';
import { ReportsListResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ReportsListResponse>> {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'));
    const language = searchParams.get('language');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'date'; // date, score, issues
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const userId = searchParams.get('userId'); // Filter by user
    const sessionId = searchParams.get('sessionId'); // Filter by session

    // Build filter
    const filter: Record<string, any> = {};

    // Filter by user ID (required for user-specific reports)
    if (userId) {
      filter.userId = userId;
    }

    // Filter by session if provided
    if (sessionId && sessionId !== 'all') {
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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Determine sort order
    let sortOrder: Record<string, any> = { createdAt: -1 };
    if (sortBy === 'score') {
      sortOrder = { 'review.overallScore': -1, createdAt: -1 };
    } else if (sortBy === 'issues') {
      sortOrder = { 'review.issues': -1, createdAt: -1 };
    }

    // Fetch total count
    const total = await ReportModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Fetch reports
    const reports = await ReportModel.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      reports: reports.map((report) => ({
        ...report,
        _id: report._id?.toString(),
      })),
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
