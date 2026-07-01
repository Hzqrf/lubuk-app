'use client';

import { useEffect } from 'react';
import { Box, Container, Loader, Center, Stack, Title, Text, Avatar, Paper, Group, Badge, Button, Divider } from '@mantine/core';
import { useProfileStore } from '@/lib/store/useProfileStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { IconFish, IconTrophy, IconBrandGoogleFilled } from '@tabler/icons-react';

export default function ProfilePage() {
  const { id } = useParams();
  const profileId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  useEffect(() => {
    if (profileId) {
      fetchProfile(profileId);
    }
  }, [profileId, fetchProfile]);

  const isOwnProfile = user?.id === profileId;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader color="blue" />
      </Center>
    );
  }

  if (!profile) {
    return (
      <Center h="100vh" flex={1}>
        <Text c="dimmed">Profile not found.</Text>
      </Center>
    );
  }

  return (
    <Box style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      <Container size="sm" py="xl" pb={80}>
        <Paper shadow="xs" p="xl" radius="md" withBorder>
          <Stack align="center" gap="sm">
            <Avatar src={profile.avatar_url} size={120} radius={120} mx="auto" />
            <Title order={2} ta="center">{profile.display_name || 'Anonymous Angler'}</Title>
            <Text c="dimmed" size="sm" ta="center">Joined {formatDistanceToNow(new Date(profile.created_at))} ago</Text>
            
            {isOwnProfile && (
              <Button variant="light" size="xs" mt="sm">Edit Profile</Button>
            )}
          </Stack>

          <Divider my="xl" />

          <Group grow align="flex-start">
            <Stack align="center" gap={4}>
              <IconFish size={32} color="var(--mantine-color-blue-filled)" />
              <Text fw={700} size="xl">{profile.total_catches}</Text>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Catches</Text>
            </Stack>

            <Stack align="center" gap={4}>
              <IconTrophy size={32} color="var(--mantine-color-yellow-filled)" />
              <Text fw={700} size="xl">{profile.favorite_species || 'None'}</Text>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Favorite</Text>
            </Stack>
          </Group>

          {isOwnProfile && (
            <Stack mt="xl" pt="xl">
              <Button color="red" variant="light" onClick={handleSignOut} fullWidth>
                Sign out
              </Button>
            </Stack>
          )}

          {!user && (
            <Stack mt="xl" pt="xl" style={{ borderTop: '1px dashed var(--mantine-color-default-border)' }}>
              <Text ta="center" size="sm" c="dimmed">
                Want to track your own catches?
              </Text>
              <Button
                leftSection={<IconBrandGoogleFilled size={16} />}
                variant="default"
                onClick={() => signInWithGoogle()}
                fullWidth
              >
                Sign in with Google
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
