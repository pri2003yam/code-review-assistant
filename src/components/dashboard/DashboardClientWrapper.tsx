'use client';

import { ReactNode } from 'react';
import { SessionInfo } from '@/components/dashboard/SessionInfo';

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">{children}</div>
        <div className="lg:col-span-1">
          <SessionInfo />
        </div>
      </div>
    </div>
  );
}
