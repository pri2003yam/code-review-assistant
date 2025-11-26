import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { connectToDatabase } from '@/lib/mongodb';
import { UserSessionModel } from '@/models/UserSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Session ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify user session
    const userSession = await UserSessionModel.findOne({
      userId,
      sessionId,
      isActive: true,
    });

    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Update last activity
    userSession.lastActivity = new Date();
    await userSession.save();

    return NextResponse.json({
      success: true,
      user: {
        userId: userSession.userId,
        email: userSession.email,
        sessionId: userSession.sessionId,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify session';
    return NextResponse.json(
      { success: false, error: `Verification failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
