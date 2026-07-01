import { Metadata } from 'next';
import { TournamentList } from '@/features/tournaments/TournamentList';

export const metadata: Metadata = {
  title: 'Tournaments | Lubuk',
  description: 'Compete in fishing tournaments and win prizes.',
};

export default function TournamentsPage() {
  return <TournamentList />;
}
