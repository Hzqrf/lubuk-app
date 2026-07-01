'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Center, Loader, Stack, Text, Button, Container, Paper } from '@mantine/core';
import { IconBrandGoogleFilled } from '@tabler/icons-react';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, isInitialized, router]);

  if (!isInitialized) {
    return (
      <Center h="100vh">
        <Loader color="blue" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Container size="xs" py="xl" style={{ display: 'flex', alignItems: 'center', minHeight: '80vh' }}>
        <Paper shadow="xs" p="xl" radius="md" withBorder style={{ width: '100%' }}>
          <Stack align="center" gap="md" py="xl">
            <Text fw={600} size="xl" ta="center">My Profile</Text>
            <Text ta="center" c="dimmed" size="sm">
              Please sign in to view and manage your profile, catches, and achievements.
            </Text>
            <Button
              leftSection={<IconBrandGoogleFilled size={18} />}
              size="md"
              variant="default"
              fullWidth
              onClick={signInWithGoogle}
              style={{ marginTop: 8 }}
            >
              Continue with Google
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Center h="100vh">
      <Loader color="blue" />
    </Center>
  );
}
