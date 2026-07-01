'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Drawer, Stack, Text, Group, Avatar, ActionIcon, TextInput,
  Button, Divider, ScrollArea, Loader, Center, Box
} from '@mantine/core';
import { IconTrash, IconSend } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface CommentDrawerProps {
  catchId: string;
  opened: boolean;
  onClose: () => void;
}

export function CommentDrawer({ catchId, opened, onClose }: CommentDrawerProps) {
  const user = useAuthStore((state) => state.user);
  const comments = useSocialStore((state) => state.comments[catchId]);
  const commentsList = comments || [];
  const fetchComments = useSocialStore((state) => state.fetchComments);
  const addComment = useSocialStore((state) => state.addComment);
  const deleteComment = useSocialStore((state) => state.deleteComment);

  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (opened && catchId) {
      setIsFetching(true);
      fetchComments(catchId).finally(() => setIsFetching(false));
    }
  }, [opened, catchId, fetchComments]);

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
    setIsPosting(true);
    try {
      await addComment(catchId, user.id, content.trim(), {
        display_name: user.user_metadata?.full_name || 'Angler',
        avatar_url: user.user_metadata?.avatar_url || '',
      });
      setContent('');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="md">Comments</Text>}
      position="bottom"
      size="70%"
      overlayProps={{ opacity: 0.4, blur: 3 }}
      styles={{
        content: { borderTopLeftRadius: 16, borderTopRightRadius: 16, display: 'flex', flexDirection: 'column' },
        header: { padding: '12px 20px', borderBottom: '1px solid var(--mantine-color-default-border)' },
        body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' },
      }}
    >
      {/* Comment list */}
      <ScrollArea flex={1} p="md" style={{ flex: 1 }}>
        {isFetching && (
          <Center py="lg">
            <Loader type="dots" color="blue" />
          </Center>
        )}

        {!isFetching && commentsList.length === 0 && (
          <Center py="xl" style={{ flexDirection: 'column' }}>
            <Text size="xl" mb="xs">💬</Text>
            <Text c="dimmed" size="sm">No comments yet. Be the first!</Text>
          </Center>
        )}

        <Stack gap="md">
          {commentsList.map((comment) => (
            <Group key={comment.id} align="flex-start" gap="sm" wrap="nowrap">
              <Avatar
                src={comment.profiles?.avatar_url}
                size="sm"
                radius="xl"
                style={{ flexShrink: 0 }}
              />
              <Box style={{ flex: 1 }}>
                <Group gap="xs" mb={2}>
                  <Text size="sm" fw={600}>{comment.profiles?.display_name || 'Angler'}</Text>
                  <Text size="xs" c="dimmed">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </Text>
                </Group>
                <Text size="sm" style={{ wordBreak: 'break-word' }}>{comment.content}</Text>
              </Box>
              {user?.id === comment.user_id && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => deleteComment(comment.id, catchId)}
                  style={{ flexShrink: 0 }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              )}
            </Group>
          ))}
        </Stack>
      </ScrollArea>

      <Divider />

      {/* Input area */}
      <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
        {user ? (
          <Group gap="sm">
            <Avatar src={user.user_metadata?.avatar_url} size="sm" radius="xl" />
            <TextInput
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              style={{ flex: 1 }}
              radius="xl"
            />
            <ActionIcon
              color="blue"
              variant="filled"
              size="lg"
              radius="xl"
              loading={isPosting}
              disabled={!content.trim()}
              onClick={handleSubmit}
            >
              <IconSend size={16} />
            </ActionIcon>
          </Group>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py="xs">Sign in to leave a comment.</Text>
        )}
      </Box>
    </Drawer>
  );
}
