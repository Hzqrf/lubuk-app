import { Metadata } from 'next';
import { JournalDashboard } from '@/features/journal/JournalDashboard';

export const metadata: Metadata = {
  title: 'My Journal | Lubuk',
  description: 'Your personal fishing journal and statistics.',
};

export default function JournalPage() {
  return <JournalDashboard />;
}
