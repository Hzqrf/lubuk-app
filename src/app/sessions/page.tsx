import { Metadata } from 'next';
import { SessionDashboard } from '@/features/sessions/SessionDashboard';

export const metadata: Metadata = {
  title: 'Fishing Sessions | Lubuk',
  description: 'Track and manage your fishing sessions.',
};

export default function SessionsPage() {
  return <SessionDashboard />;
}
