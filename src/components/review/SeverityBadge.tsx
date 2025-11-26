'use client';

import { Badge } from '@/components/ui/badge';
import { getSeverityColor, getSeverityIcon } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const color = getSeverityColor(severity);
  const icon = getSeverityIcon(severity);
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <Badge className={`${color} border`}>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
}
