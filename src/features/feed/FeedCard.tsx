'use client';

import { useState, useEffect } from 'react';
import { Card, Image, Text, Group, Avatar, ActionIcon, Stack, Box, Divider, Menu } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconMessageCircle, IconShare, IconFlag, IconDots } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { FeedCatch } from '@/lib/store/useFeedStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';
import { CommentDrawer } from '@/features/comments/CommentDrawer';
import { ReportModal } from '@/features/moderation/ReportModal';

interface FeedCardProps {
  catchData: FeedCatch;
}

export function FeedCard({ catchData }: FeedCardProps) {
  const { id, profiles, image_url, species, timestamp, note } = catchData;
  
  const speciesList = useSpeciesStore((state) => state.species);
  const fetchSpecies = useSpeciesStore((state) => state.fetchSpecies);

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  const speciesInfo = speciesList.find(
    (s) => s.name.toLowerCase() === species?.toLowerCase()
  );

  const user = useAuthStore((state) => state.user);
  const likes = useSocialStore((state) => state.likes[id]);
  const comments = useSocialStore((state) => state.comments[id]);

  const likesList = likes || [];
  const commentsList = comments || [];
  const toggleLike = useSocialStore((state) => state.toggleLike);
  const fetchLikes = useSocialStore((state) => state.fetchLikes);
  const fetchComments = useSocialStore((state) => state.fetchComments);

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    fetchLikes(id);
    fetchComments(id);
  }, [id, fetchLikes, fetchComments]);

  const hasLiked = user ? likesList.some((l) => l.user_id === user.id) : false;

  const handleLike = () => {
    if (!user) return;
    toggleLike(id, user.id);
  };

  return (
    <>
      <Card shadow="xs" padding={0} radius="lg" withBorder mb="md" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <Group justify="space-between" px="md" py="sm">
          <Group gap="sm">
            <Avatar src={profiles?.avatar_url} radius="xl" size="md" alt={profiles?.display_name || 'Angler'} />
            <Box>
              <Text size="sm" fw={600} lh={1.2}>{profiles?.display_name || 'Anonymous Angler'}</Text>
              <Text size="xs" c="dimmed">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</Text>
            </Box>
          </Group>
          <Group gap="xs">
            <Text size="xl" title={species}>{speciesInfo?.emoji}</Text>
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconFlag size={14} />}
                  color="red"
                  onClick={() => setReportModalOpen(true)}
                >
                  Report
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Image */}
        {image_url && (
          <Image
            src={image_url}
            height={300}
            alt={`${species} catch`}
            fallbackSrc="https://placehold.co/600x400?text=Fish+Catch"
            fit="cover"
            style={{ display: 'block' }}
          />
        )}

        {/* Actions */}
        <Box px="md" pt="sm">
          <Group gap="md">
            <ActionIcon
              variant="subtle"
              color={hasLiked ? 'red' : 'gray'}
              onClick={handleLike}
              size="lg"
              style={{ transition: 'transform 0.15s ease', transform: hasLiked ? 'scale(1.15)' : 'scale(1)' }}
            >
              {hasLiked ? <IconHeartFilled size={26} /> : <IconHeart size={26} />}
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={() => setCommentDrawerOpen(true)}
            >
              <IconMessageCircle size={26} />
            </ActionIcon>
          </Group>

          {/* Counts */}
          <Stack gap={2} mt="xs" pb="md">
            {likesList.length > 0 && (
              <Text size="sm" fw={700}>{likesList.length} {likesList.length === 1 ? 'like' : 'likes'}</Text>
            )}
            <Text size="sm">
              <Text component="span" fw={700} mr={6}>{profiles?.display_name || 'Angler'}</Text>
              Caught a <Text component="span" fw={600}>{species}</Text>{note ? ` · ${note}` : ''}
            </Text>
            {commentsList.length > 0 && (
              <Text
                size="sm"
                c="dimmed"
                style={{ cursor: 'pointer' }}
                onClick={() => setCommentDrawerOpen(true)}
              >
                View all {commentsList.length} comments
              </Text>
            )}
          </Stack>
        </Box>
      </Card>

      <CommentDrawer
        catchId={id}
        opened={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
      />

      <ReportModal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        catchId={id}
      />
    </>
  );
}
