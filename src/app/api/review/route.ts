import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/mongodb';
import { reviewCode, countLinesOfCode } from '@/lib/gemini';
import { ReportModel } from '@/models/Report';
import { ReviewRequest, ReviewResponse } from '@/types';
import { isSupportedFileType } from '@/lib/utils';

export async function POST(request: NextRequest): Promise<NextResponse<ReviewResponse>> {
  try {
    const body = (await request.json()) as ReviewRequest & {
      userId?: string;
      sessionId?: string;
      deviceId?: string;
      deviceName?: string;
    };
    const { code, language, fileName, userId, sessionId, deviceId, deviceName } = body;

    // Validate input
    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Code content is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Programming language is required' },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'File name is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isSupportedFileType(fileName)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Call Gemini API to review code - this must succeed
    const review = await reviewCode(code, language);

    // Count lines of code
    const linesOfCode = countLinesOfCode(code);

    // Save to database (without graceful fallback - if DB fails, the error will be returned)
    await connectToDatabase();
    const report = await ReportModel.create({
      fileName,
      language,
      originalCode: code,
      review,
      metadata: {
        linesOfCode,
        analysisTime: 0,
        model: 'gemini-api', // Dynamic model determined by getAvailableModels()
      },
      userId: userId,
      sessionId: sessionId || 'unknown',
      deviceId: deviceId || 'unknown',
      deviceName: deviceName || 'Unknown Device',
    });

    return NextResponse.json({
      success: true,
      report: {
        _id: (report._id?.toString?.() || report._id) as string,
        fileName: report.fileName,
        language: report.language,
        originalCode: report.originalCode,
        review: report.review,
        metadata: report.metadata,
        userId: report.userId,
        sessionId: report.sessionId,
        deviceId: report.deviceId,
        deviceName: report.deviceName,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    console.error('Review error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze code';
    
    return NextResponse.json(
      { success: false, error: `Failed to analyze code: ${errorMessage}` },
      { status: 500 }
    );
  }
}
