import { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard - CodeReview AI',
  description: 'View your code review history and statistics',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
