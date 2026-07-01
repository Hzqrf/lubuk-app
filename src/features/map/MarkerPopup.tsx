'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Group, Badge, CloseButton, Stack, Image, ActionIcon, Divider, Avatar } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconMessageCircle, IconFlag, IconShare } from '@tabler/icons-react';
import { MarkerData } from '@/lib/store/useMarkerStore';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { CommentDrawer } from '@/features/comments/CommentDrawer';
import { ReportModal } from '@/features/moderation/ReportModal';
import { ShareCatchCard } from '@/features/sharing/ShareCatchCard';
import { createClient } from '@/lib/supabase/client';

interface MarkerPopupProps {
  marker: MarkerData;
  onClose: () => void;
}

const supabase = createClient();

export function MarkerPopup({ marker, onClose }: MarkerPopupProps) {
  const { getByName } = useSpeciesStore();
  const speciesInfo = getByName(marker.species);

  const user = useAuthStore((state) => state.user);
  const likes = useSocialStore((state) => state.likes[marker.id]);
  const comments = useSocialStore((state) => state.comments[marker.id]);
  const likesList = likes || [];
  const commentsList = comments || [];
  const toggleLike = useSocialStore((state) => state.toggleLike);
  const fetchLikes = useSocialStore((state) => state.fetchLikes);
  const fetchComments = useSocialStore((state) => state.fetchComments);

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const [authorName, setAuthorName] = useState('Angler');
  const [authorAvatar, setAuthorAvatar] = useState('');

  useEffect(() => {
    fetchLikes(marker.id);
    fetchComments(marker.id);

    // Fetch author profile
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', marker.user_id)
          .single();
        if (data) {
          setAuthorName(data.display_name || 'Angler');
          setAuthorAvatar(data.avatar_url || '');
        }
      } catch (e) {
        console.warn('Failed to load author profile for popup:', e);
      }
    };
    fetchProfile();
  }, [marker.id, marker.user_id, fetchLikes, fetchComments]);

  const hasLiked = user ? likesList.some((l) => l.user_id === user.id) : false;

  const handleLike = () => {
    if (!user) return;
    toggleLike(marker.id, user.id);
  };

  const feedCatchData = {
    ...marker,
    profiles: {
      display_name: authorName,
      avatar_url: authorAvatar
    }
  };

  return (
    <>
      <Card shadow="sm" p="md" radius="md" withBorder w={300} style={{ overflow: 'visible' }}>
        {/* Header */}
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <Text size="xl">{speciesInfo?.emoji}</Text>
              <Stack gap={0}>
                <Text fw={700} size="sm">{marker.species}</Text>
                <Text size="xs" c="dimmed">
                  {new Date(marker.timestamp).toLocaleDateString('en-MY', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })} at {new Date(marker.timestamp).toLocaleTimeString('en-MY', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                  })}
                </Text>
              </Stack>
            </Group>
            <CloseButton onClick={onClose} size="sm" />
          </Group>
        </Card.Section>

        {/* Image */}
        {marker.image_url && (
          <Card.Section>
            <Image
              src={marker.image_url}
              height={160}
              alt="Fish catch"
              fallbackSrc="https://placehold.co/600x400?text=Fish+Catch"
              fit="cover"
            />
          </Card.Section>
        )}

        {/* Note */}
        {marker.note && (
          <Text size="sm" c="dimmed" mt="sm">
            {marker.note}
          </Text>
        )}

        <Divider mt="sm" />

        {/* Social actions */}
        <Group justify="space-between" mt="sm">
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color={hasLiked ? 'red' : 'gray'}
              onClick={handleLike}
              size="md"
              style={{ transition: 'transform 0.15s', transform: hasLiked ? 'scale(1.2)' : 'scale(1)' }}
            >
              {hasLiked ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
            </ActionIcon>
            {likesList.length > 0 && <Text size="xs" fw={600}>{likesList.length}</Text>}

            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setCommentDrawerOpen(true)}
              size="md"
            >
              <IconMessageCircle size={18} />
            </ActionIcon>
            {commentsList.length > 0 && <Text size="xs" c="dimmed">{commentsList.length}</Text>}
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              title="Share catch card"
            >
              <IconShare size={16} />
            </ActionIcon>
            
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setReportModalOpen(true)}
              title="Report catch"
            >
              <IconFlag size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>

      <CommentDrawer
        catchId={marker.id}
        opened={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
      />

      <ReportModal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        catchId={marker.id}
      />

      <ShareCatchCard
        catchData={feedCatchData}
        opened={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </>
  );
}

