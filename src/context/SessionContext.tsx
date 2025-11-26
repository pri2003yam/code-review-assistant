'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SessionData {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  createdAt: string;
  lastActivity: string;
}

interface SessionContextType {
  session: SessionData | null;
  isLoading: boolean;
  updateLastActivity: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Generate a unique device ID based on browser fingerprinting
function generateDeviceId(): string {
  const stored = localStorage.getItem('device_id');
  if (stored) return stored;

  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('device_id', deviceId);
  return deviceId;
}

// Generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get device name from user agent
function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device';

  const ua = navigator.userAgent;
  let deviceName = 'Unknown Device';

  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    if (/ipad/i.test(ua)) deviceName = 'iPad';
    else if (/iphone/i.test(ua)) deviceName = 'iPhone';
    else if (/android/i.test(ua)) deviceName = 'Android Device';
    else deviceName = 'Mobile Device';
  } else if (/windows/i.test(ua)) {
    deviceName = 'Windows PC';
  } else if (/mac/i.test(ua)) {
    deviceName = 'MacBook';
  } else if (/linux/i.test(ua)) {
    deviceName = 'Linux Device';
  }

  return deviceName;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize session on client side only
    const deviceId = generateDeviceId();
    const deviceName = getDeviceName();

    // Check if session exists and is still valid (24 hour expiry)
    const storedSession = localStorage.getItem('session_data');
    let currentSession: SessionData;

    if (storedSession) {
      try {
        currentSession = JSON.parse(storedSession);
        const createdTime = new Date(currentSession.createdAt).getTime();
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (now - createdTime > twentyFourHours) {
          // Session expired, create new one
          currentSession = {
            sessionId: generateSessionId(),
            deviceId,
            deviceName,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          };
        } else {
          // Session still valid, update device name if changed
          currentSession.deviceName = deviceName;
          currentSession.lastActivity = new Date().toISOString();
        }
      } catch {
        // Invalid stored session, create new one
        currentSession = {
          sessionId: generateSessionId(),
          deviceId,
          deviceName,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };
      }
    } else {
      // No session exists, create new one
      currentSession = {
        sessionId: generateSessionId(),
        deviceId,
        deviceName,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
    }

    localStorage.setItem('session_data', JSON.stringify(currentSession));
    setSession(currentSession);
    setIsLoading(false);
  }, []);

  const updateLastActivity = () => {
    if (session) {
      const updated = {
        ...session,
        lastActivity: new Date().toISOString(),
      };
      localStorage.setItem('session_data', JSON.stringify(updated));
      setSession(updated);
    }
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, updateLastActivity }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
