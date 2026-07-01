import { Metadata } from 'next';
import { ReputationView } from '@/features/reputation/ReputationView';

export const metadata: Metadata = {
  title: 'Reputation & Achievements | Lubuk',
  description: 'Your angler reputation and unlocked achievements.',
};

export default function ReputationPage() {
  return <ReputationView />;
}
