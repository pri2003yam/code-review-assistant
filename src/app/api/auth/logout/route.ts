import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { connectToDatabase } from '@/lib/mongodb';
import { UserSessionModel } from '@/models/UserSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Mark user session as inactive
    const userSession = await UserSessionModel.findOneAndUpdate(
      { userId },
      { isActive: false },
      { new: true }
    );

    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'User session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully!',
    });
  } catch (error) {
    console.error('Logout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
    return NextResponse.json(
      { success: false, error: `Logout failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
