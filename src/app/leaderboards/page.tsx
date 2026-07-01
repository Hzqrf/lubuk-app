import { Metadata } from 'next';
import { LeaderboardView } from '@/features/leaderboards/LeaderboardView';

export const metadata: Metadata = {
  title: 'Leaderboards | Lubuk',
  description: 'Global and local fishing leaderboards.',
};

export default function LeaderboardsPage() {
  return <LeaderboardView />;
}
