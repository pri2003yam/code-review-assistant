import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/mongodb';
import { UserSessionModel } from '@/models/UserSession';

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceName(): string {
  return 'Web Browser';
}

function getDeviceId(): string {
  return `device_${Math.random().toString(36).substr(2, 9)}`;
}

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

    // Check if user already exists
    const existingUser = await UserSessionModel.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // User exists, return their session
      return NextResponse.json({
        success: true,
        user: {
          userId: existingUser.userId,
          email: existingUser.email,
          sessionId: existingUser.sessionId,
        },
        message: 'Welcome back!',
      });
    }

    // Create new user session
    const userId = generateUserId();
    const sessionId = generateSessionId();
    const deviceId = getDeviceId();
    const deviceName = getDeviceName();

    const newUserSession = await UserSessionModel.create({
      userId,
      email: email.toLowerCase(),
      sessionId,
      deviceName,
      deviceId,
      isActive: true,
      lastActivity: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: newUserSession.userId,
          email: newUserSession.email,
          sessionId: newUserSession.sessionId,
        },
        message: 'Account created successfully!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
    return NextResponse.json(
      { success: false, error: `Signup failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
