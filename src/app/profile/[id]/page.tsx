'use client';

import { useParams } from 'next/navigation';
import { UserProfilePage } from '@/features/profiles/UserProfilePage';
import { ScrollArea, Box } from '@mantine/core';

export default function ProfilePage() {
  const { id } = useParams();
  const profileId = Array.isArray(id) ? id[0] : id;

  if (!profileId) return null;

  return (
    <ScrollArea h="100%" type="auto">
      <Box style={{ width: '100%', minHeight: '100%' }}>
        <UserProfilePage userId={profileId} />
      </Box>
    </ScrollArea>
  );
}
