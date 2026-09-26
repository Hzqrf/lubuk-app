// ============================================================
// SHAREABLE CATCH CARD - Social Share Card Generator
// ============================================================

'use client';

import { useRef, useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Group,
  Button,
  Stack,
  Text,
  CopyButton,
  ActionIcon,
  Tooltip,
  Badge,
  Center,
  Loader,
} from '@mantine/core';
import {
  IconDownload,
  IconShare2,
  IconCheck,
  IconCopy,
} from '@tabler/icons-react';
import html2canvas from 'html2canvas';
import { formatDistanceToNow } from 'date-fns';
import { ShareableCatchCard as ShareableCatchCardType } from '@/lib/types';

interface ShareableCatchCardProps {
  opened: boolean;
  onClose: () => void;
  catchData: {
    id: string;
    image_url: string;
    fish_species: string;
    profiles?: { display_name: string };
    created_at: string;
    note?: string;
    latitude?: number;
    longitude?: number;
  };
}

export function ShareableCatchCardModal({
  opened,
  onClose,
  catchData,
}: ShareableCatchCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && catchData) {
      const url = `${window.location.origin}/catch/${catchData.id}`;
      setShareUrl(url);
    }
  }, [catchData]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `catch-${catchData.id}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my catch!`,
          text: `I caught a ${catchData.fish_species} on Lubuk!`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Share Your Catch"
      centered
      size="lg"
    >
      <Stack gap="lg">
        {/* Shareable Card Preview */}
        <Box
          ref={cardRef}
          p="lg"
          style={{
            background: 'linear-gradient(135deg, #1E5A96 0%, #2E7BA4 100%)',
            borderRadius: 12,
            color: 'white',
            maxWidth: '100%',
          }}
        >
          <Stack gap="md">
            {/* Header */}
            <Box>
              <Badge color="cyan" size="lg">
                🎣 Lubuk Fishing
              </Badge>
            </Box>

            {/* Image */}
            {catchData.image_url && (
              <Box
                component="img"
                src={catchData.image_url}
                alt={catchData.fish_species}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            )}

            {/* Content */}
            <Stack gap="sm">
              <Box>
                <Text size="xl" fw={700}>
                  {catchData.fish_species}
                </Text>
                <Text size="sm" c="rgba(255, 255, 255, 0.8)">
                  Caught by {catchData.profiles?.display_name || 'Anonymous Angler'}
                </Text>
              </Box>

              {catchData.note && (
                <Text size="sm" c="rgba(255, 255, 255, 0.9)">
                  "{catchData.note}"
                </Text>
              )}

              <Text size="xs" c="rgba(255, 255, 255, 0.7)">
                {formatDistanceToNow(new Date(catchData.created_at), {
                  addSuffix: true,
                })}
              </Text>
            </Stack>

            {/* Footer */}
            <Box
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                paddingTop: 12,
                textAlign: 'center',
              }}
            >
              <Text size="xs" c="rgba(255, 255, 255, 0.6)">
                lubuk.app - Fishing Community
              </Text>
            </Box>
          </Stack>
        </Box>

        {/* Share URL */}
        <Group justify="space-between" wrap="nowrap" p="sm" style={{
          background: 'var(--mantine-color-gray-0)',
          borderRadius: 'var(--mantine-radius-md)',
        }}>
          <Text size="sm" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shareUrl}
          </Text>
          <CopyButton value={shareUrl} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied!' : 'Copy link'} withArrow position="left">
                <ActionIcon
                  color={copied ? 'teal' : 'gray'}
                  variant="subtle"
                  onClick={copy}
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>

        {/* Action Buttons */}
        <Group justify="flex-end">
          <Button
            variant="default"
            leftSection={<IconShare2 size={16} />}
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            leftSection={isGenerating ? <Loader size={16} /> : <IconDownload size={16} />}
            onClick={handleDownload}
            loading={isGenerating}
          >
            Download
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ============================================================
// STANDALONE SHAREABLE CARD (For Profile, etc.)
// ============================================================

interface ShareableCardProps {
  catchData: ShareableCatchCardType;
  imageOnly?: boolean;
}

export function ShareableCard({ catchData, imageOnly = false }: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const timeAgo = formatDistanceToNow(new Date(catchData.timestamp), {
    addSuffix: true,
  });

  if (imageOnly) {
    return (
      <Box
        ref={cardRef}
        p="lg"
        style={{
          background: 'linear-gradient(135deg, #1E5A96 0%, #2E7BA4 100%)',
          borderRadius: 12,
          color: 'white',
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        <Stack gap="md">
          {/* Image */}
          <Box
            component="img"
            src={catchData.imageUrl}
            alt={catchData.species}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: 8,
            }}
          />

          {/* Content */}
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text size="lg" fw={700}>
                  {catchData.species}
                </Text>
                <Text size="sm" c="rgba(255, 255, 255, 0.8)">
                  {catchData.username}
                </Text>
              </Box>
              <Badge color="cyan">Lubuk</Badge>
            </Group>

            {catchData.catchNote && (
              <Text size="sm" c="rgba(255, 255, 255, 0.9)">
                "{catchData.catchNote}"
              </Text>
            )}

            <Text size="xs" c="rgba(255, 255, 255, 0.7)">
              {timeAgo}
            </Text>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Center>
      <Text>Share card component</Text>
    </Center>
  );
}

// ============================================================
// EXPORT
// ============================================================
