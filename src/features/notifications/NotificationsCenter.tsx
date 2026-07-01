// ============================================================
// NOTIFICATIONS CENTER - Real-time Notifications UI
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import {
  Drawer,
  Stack,
  Group,
  Text,
  Avatar,
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Loader,
  UnstyledButton,
  ThemeIcon,
} from '@mantine/core';
import { IconBell, IconX, IconCheck, IconTrash } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { notificationsService } from '@/features/notifications/notificationsService';
import { Notification, NotificationWithProfiles } from '@/lib/types';

interface NotificationsCenterProps {
  opened: boolean;
  onClose: () => void;
}

export function NotificationsCenter({ opened, onClose }: NotificationsCenterProps) {
  const user = useAuthStore((state) => state.user);
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useSocialStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (opened && user) {
      loadNotifications();
    }
  }, [opened, user]);

  const loadNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await fetchNotifications(user.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationsService.markAllAsRead(user.id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationMessage = (notification: NotificationWithProfiles) => {
    const actor = (notification as any).actor;
    const actorName = actor?.display_name || 'Someone';

    switch (notification.event_type) {
      case 'follow':
        return `${actorName} followed you`;
      case 'like':
        return `${actorName} liked your catch`;
      case 'comment':
        return `${actorName} commented on your catch`;
      default:
        return 'New notification';
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Notifications"
      position="right"
      size="sm"
    >
      <Stack gap="md" h="100%">
        {/* Header with Mark All as Read */}
        <Group justify="space-between">
          <Badge color="blue" variant="light">
            {unreadCount} unread
          </Badge>
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Group>

        {/* Notifications List */}
        <Stack gap="sm" style={{ flex: 1, overflow: 'auto' }}>
          {isLoading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : notifications.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed" size="sm">
                No notifications yet
              </Text>
            </Center>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
                onDelete={() => handleDeleteNotification(notification.id)}
              />
            ))
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}

// ============================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================

interface NotificationItemProps {
  notification: NotificationWithProfiles;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const actor = (notification as any).actor;
  const message = getNotificationMessage(notification);

  const getNotificationMessage = (notification: NotificationWithProfiles) => {
    const actor = (notification as any).actor;
    const actorName = actor?.display_name || 'Someone';

    switch (notification.event_type) {
      case 'follow':
        return `${actorName} followed you`;
      case 'like':
        return `${actorName} liked your catch`;
      case 'comment':
        return `${actorName} commented on your catch`;
      default:
        return 'New notification';
    }
  };

  return (
    <Box
      p="sm"
      style={{
        backgroundColor: notification.is_read ? 'transparent' : 'var(--mantine-color-blue-0)',
        borderRadius: 'var(--mantine-radius-md)',
        transition: 'background-color 0.2s',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Avatar
            src={actor?.avatar_url}
            size="md"
            radius="xl"
            alt={actor?.display_name}
          />
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {message}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </Text>
          </Box>
        </Group>

        <Group gap={4}>
          {!notification.is_read && (
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={onMarkAsRead}
              title="Mark as read"
            >
              <IconCheck size={14} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={onDelete}
            title="Delete"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Box>
  );
}

// ============================================================
// NOTIFICATION BADGE COMPONENT
// ============================================================

interface NotificationBadgeProps {
  onClick: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const user = useAuthStore((state) => state.user);
  const { unreadCount, fetchNotifications } = useSocialStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && unreadCount === 0) {
      // Fetch on mount to get initial count
      const timer = setTimeout(() => {
        setIsLoading(true);
        fetchNotifications(user.id).finally(() => setIsLoading(false));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, fetchNotifications, unreadCount]);

  return (
    <ThemeIcon
      variant="subtle"
      size="lg"
      onClick={onClick}
      style={{ position: 'relative' }}
    >
      <IconBell size={20} />
      {unreadCount > 0 && (
        <Badge
          color="red"
          size="sm"
          variant="filled"
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            pointerEvents: 'none',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </ThemeIcon>
  );
}
