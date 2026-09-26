// ============================================================
// SOCIAL FEED - Home Feed with Following & Trending
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Tabs,
  Stack,
  Loader,
  Center,
  Text,
  Button,
  ScrollArea,
} from '@mantine/core';
import { IconActivity, IconFlame, IconUsers } from '@tabler/icons-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useFeedStore } from '@/lib/store/useFeedStore';
import { followService } from '@/features/follows/followService';
import { FeedCard } from '@/features/feed/FeedCard';
import { activityService } from '@/features/notifications/activityService';

export function SocialFeed() {
  const user = useAuthStore((state) => state.user);
  const { feed, isLoading, hasMore, fetchFeed } = useFeedStore();

  const [followingFeed, setFollowingFeed] = useState<any[]>([]);
  const [trendingFeed, setTrendingFeed] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [feedType, setFeedType] = useState<'following' | 'trending' | 'activity'>('following');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load following feed
  useEffect(() => {
    if (feedType === 'following' && user) {
      loadFollowingFeed();
    }
  }, [feedType, user]);

  // Load trending feed
  useEffect(() => {
    if (feedType === 'trending') {
      loadTrendingFeed();
    }
  }, [feedType]);

  // Load activity feed
  useEffect(() => {
    if (feedType === 'activity' && user) {
      loadActivityFeed();
    }
  }, [feedType, user]);

  const loadFollowingFeed = useCallback(async () => {
    if (!user) return;
    try {
      const data = await followService.getFollowingFeed(user.id);
      setFollowingFeed(data);
    } catch (error) {
      console.error('Error loading following feed:', error);
    }
  }, [user]);

  const loadTrendingFeed = useCallback(async () => {
    try {
      // Fetch catches ordered by engagement (likes + comments)
      const { data } = await supabase
        .from('catches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setTrendingFeed(data || []);
    } catch (error) {
      console.error('Error loading trending feed:', error);
    }
  }, []);

  const loadActivityFeed = useCallback(async () => {
    if (!user) return;
    try {
      const data = await activityService.getFollowingActivityFeed(user.id);
      setActivityFeed(data);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    }
  }, [user]);

  const handleLoadMore = useCallback(async () => {
    if (feedType === 'following') {
      setIsLoadingMore(true);
      try {
        await loadFollowingFeed();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [feedType, loadFollowingFeed]);

  const renderFeed = () => {
    const feeds = {
      following: followingFeed,
      trending: trendingFeed,
      activity: activityFeed,
    };

    const currentFeed = feeds[feedType];

    if (currentFeed.length === 0 && !isLoading) {
      return (
        <Center py="xl">
          <Stack gap="md" align="center">
            <Text c="dimmed">No content yet</Text>
            {feedType === 'following' && (
              <Button variant="default" size="sm">
                Find people to follow
              </Button>
            )}
          </Stack>
        </Center>
      );
    }

    return (
      <Stack gap="md">
        {currentFeed.map((item, index) => (
          <FeedCard key={`${feedType}-${index}`} catchData={item} />
        ))}
        {hasMore && feedType === 'following' && (
          <Center py="lg">
            {isLoadingMore ? (
              <Loader size="sm" />
            ) : (
              <Button variant="light" onClick={handleLoadMore}>
                Load more
              </Button>
            )}
          </Center>
        )}
      </Stack>
    );
  };

  return (
    <Container size="sm" py="lg">
      <Tabs
        value={feedType}
        onChange={(value) => setFeedType(value as any)}
        mb="lg"
      >
        <Tabs.List>
          <Tabs.Tab value="following" leftSection={<IconUsers size={16} />}>
            Following
          </Tabs.Tab>
          <Tabs.Tab value="trending" leftSection={<IconFlame size={16} />}>
            Trending
          </Tabs.Tab>
          <Tabs.Tab value="activity" leftSection={<IconActivity size={16} />}>
            Activity
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {isLoading && feedType === 'following' ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        renderFeed()
      )}
    </Container>
  );
}

// Import supabase for trending feed
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
