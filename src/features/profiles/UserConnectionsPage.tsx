// ============================================================
// FOLLOWERS/FOLLOWING PAGES
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Tabs,
  Stack,
  Group,
  Avatar,
  Box,
  Text,
  Button,
  Skeleton,
  SimpleGrid,
  Loader,
  Center,
} from '@mantine/core';
import { followService } from '@/features/follows/followService';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Profile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface UserConnectionsPageProps {
  userId: string;
  type: 'followers' | 'following';
}

export function UserConnectionsPage({
  userId,
  type,
}: UserConnectionsPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { following, toggleFollow } = useSocialStore();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadConnections = async () => {
      setIsLoading(true);
      try {
        const data =
          type === 'followers'
            ? await followService.getFollowers(userId)
            : await followService.getFollowing(userId);
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadConnections();
  }, [userId, type]);

  const handleViewProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };

  const handleFollowToggle = async (targetId: string) => {
    if (!currentUser) return;
    try {
      await toggleFollow(currentUser.id, targetId);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Stack gap="md">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={70} radius="lg" />
          ))}
        </Stack>
      </Container>
    );
  }

  if (users.length === 0) {
    return (
      <Container size="md" py="xl">
        <Center py="xl">
          <Text c="dimmed">
            {type === 'followers' ? 'No followers yet' : 'Not following anyone'}
          </Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Text size="xl" fw={700}>
          {type === 'followers' ? 'Followers' : 'Following'}
        </Text>

        {users.map((user) => (
          <UserConnectionCard
            key={user.id}
            user={user}
            isFollowing={following.has(user.id)}
            onViewProfile={() => handleViewProfile(user.id)}
            onToggleFollow={() => handleFollowToggle(user.id)}
            canFollow={currentUser?.id !== user.id}
          />
        ))}
      </Stack>
    </Container>
  );
}

// ============================================================
// USER CONNECTION CARD
// ============================================================

interface UserConnectionCardProps {
  user: Profile;
  isFollowing: boolean;
  onViewProfile: () => void;
  onToggleFollow: () => void;
  canFollow: boolean;
}

function UserConnectionCard({
  user,
  isFollowing,
  onViewProfile,
  onToggleFollow,
  canFollow,
}: UserConnectionCardProps) {
  return (
    <Box
      p="md"
      style={{
        border: '1px solid var(--mantine-color-gray-2)',
        borderRadius: 'var(--mantine-radius-md)',
        transition: 'background-color 0.15s',
      }}
      className="hover:bg-gray-0"
    >
      <Group justify="space-between">
        <Group gap="md" style={{ flex: 1 }}>
          <Avatar
            src={user.avatar_url}
            size="lg"
            radius="xl"
            alt={user.display_name}
          />

          <Box style={{ flex: 1 }}>
            <Text fw={600} size="sm">
              {user.display_name}
            </Text>
            <Group gap="md" mt="4px">
              <Text size="xs" c="dimmed">
                {user.total_catches} catches
              </Text>
              <Text size="xs" c="dimmed">
                {user.total_followers} followers
              </Text>
            </Group>
            {user.bio && (
              <Text size="xs" c="dimmed" mt="4px" lineClamp={1}>
                {user.bio}
              </Text>
            )}
          </Box>
        </Group>

        <Group gap="sm">
          <Button
            variant="subtle"
            size="sm"
            onClick={onViewProfile}
          >
            View
          </Button>
          {canFollow && (
            <Button
              variant={isFollowing ? 'default' : 'filled'}
              size="sm"
              onClick={onToggleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  );
}
