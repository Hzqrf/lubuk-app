import { Metadata } from 'next';
import { GroupDirectory } from '@/features/groups/GroupDirectory';

export const metadata: Metadata = {
  title: 'Groups & Communities | Lubuk',
  description: 'Find and join fishing communities.',
};

export default function GroupsPage() {
  return <GroupDirectory />;
}
