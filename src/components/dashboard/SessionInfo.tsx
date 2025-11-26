'use client';

import { useSessionInfo } from '@/hooks/useSessionInfo';
import { Smartphone, Calendar, Clock } from 'lucide-react';

export function SessionInfo() {
  const { sessionId, deviceId, deviceName, createdAt, lastActivity, isLoading } = useSessionInfo();

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
        <div className="h-4 bg-slate-700 rounded animate-pulse w-48"></div>
        <div className="h-3 bg-slate-700 rounded animate-pulse w-32"></div>
      </div>
    );
  }

  const createdDate = createdAt ? new Date(createdAt).toLocaleString() : 'Unknown';
  const lastActivityDate = lastActivity ? new Date(lastActivity).toLocaleString() : 'Unknown';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Device Information
        </h3>
        <div className="text-xs text-slate-400 space-y-1 ml-6">
          <div>
            <span className="text-slate-500">Device:</span> {deviceName}
          </div>
          <div className="break-all">
            <span className="text-slate-500">Device ID:</span> {deviceId}
          </div>
          <div className="break-all">
            <span className="text-slate-500">Session ID:</span> {sessionId}
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Timeline
        </h3>
        <div className="text-xs text-slate-400 space-y-1 ml-6">
          <div>
            <span className="text-slate-500">Created:</span> {createdDate}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>
              <span className="text-slate-500">Last Active:</span> {lastActivityDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
