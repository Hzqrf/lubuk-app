'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Stack, Center, Loader, Text, Box } from '@mantine/core';
import { useFeedStore } from '@/lib/store/useFeedStore';
import { FeedCard } from './FeedCard';

export function FeedList() {
  const feed = useFeedStore((state) => state.feed);
  const isLoading = useFeedStore((state) => state.isLoading);
  const hasMore = useFeedStore((state) => state.hasMore);
  const fetchFeed = useFeedStore((state) => state.fetchFeed);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFeed(true);
  }, [fetchFeed]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        fetchFeed();
      }
    },
    [fetchFeed, hasMore, isLoading]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  return (
    <Box p="md" pb={80} maw={600} mx="auto">
      {feed.map((catchData) => (
        <FeedCard key={catchData.id} catchData={catchData} />
      ))}

      {isLoading && (
        <Center p="lg">
          <Loader color="blue" type="dots" />
        </Center>
      )}

      {!isLoading && !hasMore && feed.length > 0 && (
        <Center p="xl">
          <Text c="dimmed" size="sm">You've caught up with all the latest catches! 🎣</Text>
        </Center>
      )}

      {!isLoading && feed.length === 0 && (
        <Center py="xl" style={{ flexDirection: 'column' }}>
          <Text size="3rem" mb="sm">🎣</Text>
          <Text size="lg" fw={600} mb="xs">No catches yet</Text>
          <Text c="dimmed" size="sm">Be the first to log a catch on the map!</Text>
        </Center>
      )}

      <div ref={observerTarget} style={{ height: 20 }} />
    </Box>
  );
}
