// ============================================================
// PROFILE PAGE - User Profile Component
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Group,
  Text,
  Avatar,
  Button,
  Card,
  Tabs,
  Badge,
  Grid,
  Stack,
  ActionIcon,
  Modal,
  FileInput,
  TextInput,
  Textarea,
  Skeleton,
  Image,
  SimpleGrid,
} from '@mantine/core';
import {
  IconUser,
  IconUserPlus,
  IconUserCheck,
  IconUsers,
  IconHeart,
  IconEdit,
  IconUpload,
  IconLayoutList,
} from '@tabler/icons-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useProfileStore } from '@/lib/store/useProfileStore';
import { profileService } from '@/features/profiles/profileService';
import { badgesService, BADGE_DEFINITIONS } from '@/features/notifications/badgesService';
import { followService } from '@/features/follows/followService';
import { Profile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { FeedCard } from '@/features/feed/FeedCard';
import { FeedCatch } from '@/lib/store/useFeedStore';


interface UserProfilePageProps {
  userId: string;
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  
  const [badges, setBadges] = useState<any[]>([]);
  const [recentCatches, setRecentCatches] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<FeedCatch[]>([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  });

  const following = useSocialStore((state) => state.following);
  const toggleFollow = useSocialStore((state) => state.toggleFollow);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        await fetchProfile(userId);
        const badges = await badgesService.getUserBadges(userId);
        setBadges(badges);

        const catches = await profileService.getUserCatches(userId);
        setRecentCatches(catches);

        // Build FeedCatch-shaped posts for the Posts tab
        const profileData = await profileService.getProfile(userId);
        const posts: FeedCatch[] = catches.map((c: any) => ({
          ...c,
          species: c.fish_species,
          timestamp: c.created_at,
          profiles: {
            display_name: profileData?.display_name || 'Anonymous Angler',
            avatar_url: profileData?.avatar_url || '',
          },
        }));
        setUserPosts(posts);

        const stats = await followService.getFollowStats(userId);
        setFollowStats(stats);

        if (currentUser) {
          const isFollowingUser = await followService.isFollowing(
            currentUser.id,
            userId
          );
          setIsFollowing(isFollowingUser);
          setIsOwnProfile(currentUser.id === userId);

          if (currentUser.id === userId) {
            setFormData({
              displayName: profile?.display_name || '',
              bio: profile?.bio || '',
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [userId, currentUser, fetchProfile]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    try {
      await toggleFollow(currentUser.id, userId);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    try {
      await updateProfile(currentUser.id, {
        display_name: formData.displayName,
        bio: formData.bio,
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Stack gap="lg">
          <Skeleton height={200} circle />
          <Skeleton height={50} width="50%" />
          <Skeleton height={100} />
        </Stack>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container size="md" py="xl">
        <Text c="dimmed" ta="center">
          Profile not found
        </Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      {/* Header Card */}
      <Card shadow="sm" p="lg" radius="lg" withBorder mb="lg">
        <Group justify="space-between" wrap="nowrap">
          {/* Avatar & Basic Info */}
          <Group gap="lg">
            <Avatar
              src={profile.avatar_url}
              size={80}
              radius="xl"
              alt={profile.display_name}
            />
            <Stack gap={0}>
              <Group gap="sm" align="center">
                <Text size="lg" fw={700}>
                  {profile.display_name || 'Anonymous Angler'}
                </Text>
                {isEditingProfile && isOwnProfile && (
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                )}
              </Group>
              {profile.bio && (
                <Text size="sm" c="dimmed">
                  {profile.bio}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                Joined {formatDistanceToNow(new Date(profile.created_at), {
                  addSuffix: true,
                })}
              </Text>
            </Stack>
          </Group>

          {/* Action Button */}
          {!isOwnProfile && currentUser && (
            <Button
              leftSection={isFollowing ? <IconUserCheck size={16} /> : <IconUserPlus size={16} />}
              variant={isFollowing ? 'default' : 'filled'}
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}

          {isOwnProfile && (
            <Button
              leftSection={<IconEdit size={16} />}
              variant="default"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Profile
            </Button>
          )}
        </Group>
      </Card>

      {/* Stats Grid */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Box ta="center">
            <Text size="lg" fw={700}>
              {profile.total_catches}
            </Text>
            <Text size="sm" c="dimmed">
              Catches
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Box ta="center">
            <Text size="lg" fw={700}>
              {followStats.followers}
            </Text>
            <Text size="sm" c="dimmed">
              Followers
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Box ta="center">
            <Text size="lg" fw={700}>
              {followStats.following}
            </Text>
            <Text size="sm" c="dimmed">
              Following
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Box ta="center">
            <Text size="lg" fw={700}>
              {profile.fish_species_count}
            </Text>
            <Text size="sm" c="dimmed">
              Species
            </Text>
          </Box>
        </Grid.Col>
      </Grid>

      {/* Badges */}
      {badges.length > 0 && (
        <Card shadow="sm" p="md" radius="lg" withBorder mb="lg">
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Achievements
            </Text>
            <Group wrap="wrap">
              {badges.map((badge) => (
                <Badge
                  key={badge.id}
                  variant="light"
                  leftSection={<Text>{badge.icon_emoji}</Text>}
                  title={badge.description}
                >
                  {badge.title}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <Tabs.List>
          <Tabs.Tab value="posts" leftSection={<IconLayoutList size={16} />}>
            Posts
          </Tabs.Tab>
          <Tabs.Tab value="catches" leftSection={<IconHeart size={16} />}>
            Catches
          </Tabs.Tab>
          <Tabs.Tab value="followers" leftSection={<IconUsers size={16} />}>
            Followers
          </Tabs.Tab>
        </Tabs.List>

        {/* Posts Tab */}
        <Tabs.Panel value="posts" py="lg">
          {userPosts.length > 0 ? (
            <Stack gap={0}>
              {userPosts.map((post) => (
                <FeedCard key={post.id} catchData={post} />
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No posts yet
            </Text>
          )}
        </Tabs.Panel>

        {/* Catches Grid Tab */}
        <Tabs.Panel value="catches" py="lg">
          {recentCatches.length > 0 ? (
            <SimpleGrid cols={{ base: 2, sm: 3 }} gap="md">
              {recentCatches.map((catch_item) => (
                <Card
                  key={catch_item.id}
                  shadow="xs"
                  p={0}
                  radius="lg"
                  withBorder
                  style={{ cursor: 'pointer' }}
                >
                  {catch_item.image_url && (
                    <Image
                      src={catch_item.image_url}
                      height={150}
                      alt={catch_item.fish_species}
                      fit="cover"
                    />
                  )}
                  <Box p="sm">
                    <Text size="sm" fw={600}>
                      {catch_item.fish_species}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDistanceToNow(new Date(catch_item.created_at), {
                        addSuffix: true,
                      })}
                    </Text>
                  </Box>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text c="dimmed" ta="center" py="lg">
              No catches yet
            </Text>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="followers" py="lg">
          <FollowersList userId={userId} />
        </Tabs.Panel>
      </Tabs>

      {/* Edit Profile Modal */}
      <Modal
        opened={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        title="Edit Profile"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Display Name"
            placeholder="Your name"
            value={formData.displayName}
            onChange={(e) =>
              setFormData({ ...formData, displayName: e.currentTarget.value })
            }
          />
          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.currentTarget.value })
            }
            maxLength={200}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

// ============================================================
// FOLLOWERS LIST COMPONENT
// ============================================================

function FollowersList({ userId }: { userId: string }) {
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const data = await followService.getFollowers(userId);
        setFollowers(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowers();
  }, [userId]);

  if (isLoading) return <Skeleton height={100} />;

  if (followers.length === 0) {
    return <Text c="dimmed" ta="center">No followers yet</Text>;
  }

  return (
    <Stack gap="sm">
      {followers.map((follower) => (
        <Group key={follower.id} justify="space-between">
          <Group gap="sm">
            <Avatar src={follower.avatar_url} radius="xl" size="md" />
            <Box>
              <Text size="sm" fw={600}>
                {follower.display_name}
              </Text>
              <Text size="xs" c="dimmed">
                {follower.total_catches} catches
              </Text>
            </Box>
          </Group>
          <Button variant="subtle" size="xs">
            View
          </Button>
        </Group>
      ))}
    </Stack>
  );
}
