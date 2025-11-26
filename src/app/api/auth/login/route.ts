import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { connectToDatabase } from '@/lib/mongodb';
import { UserSessionModel } from '@/models/UserSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by email
    const userSession = await UserSessionModel.findOne({ email: email.toLowerCase() });

    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please sign up first.' },
        { status: 404 }
      );
    }

    // Update last activity
    userSession.lastActivity = new Date();
    userSession.isActive = true;
    await userSession.save();

    return NextResponse.json({
      success: true,
      user: {
        userId: userSession.userId,
        email: userSession.email,
        sessionId: userSession.sessionId,
      },
      message: 'Logged in successfully!',
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to login';
    return NextResponse.json(
      { success: false, error: `Login failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
