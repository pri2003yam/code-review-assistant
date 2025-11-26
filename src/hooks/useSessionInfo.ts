import { useSession } from '@/context/SessionContext';

export function useSessionInfo() {
  const { session, isLoading, updateLastActivity } = useSession();

  return {
    sessionId: session?.sessionId || '',
    deviceId: session?.deviceId || '',
    deviceName: session?.deviceName || 'Unknown Device',
    createdAt: session?.createdAt || '',
    lastActivity: session?.lastActivity || '',
    isLoading,
    updateActivity: updateLastActivity,
  };
}
