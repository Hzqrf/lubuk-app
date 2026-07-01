'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Button, Group, Stack, ThemeIcon, CloseButton, Transition } from '@mantine/core';
import { IconBellRinging, IconCheck } from '@tabler/icons-react';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function NotificationPrompt() {
  const user = useAuthStore((state) => state.user);
  const addPushSubscription = useNotificationStore((state) => state.addPushSubscription);
  const triggerMockNotification = useNotificationStore((state) => state.triggerMockNotification);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setVisible(false);
      return;
    }

    // Check if browser notifications are supported
    if (!('Notification' in window)) {
      return;
    }

    // Don't show if already granted, denied, or already prompted in this browser session
    const prompted = localStorage.getItem('lubuk_push_prompted');
    if (Notification.permission === 'default' && !prompted) {
      // Delay prompt appearance for premium UX
      const timer = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      
      localStorage.setItem('lubuk_push_prompted', 'true');
      
      if (permission === 'granted' && user) {
        // Mock subscription details for WebPush structure
        const mockSubscription = {
          endpoint: 'https://fcm.googleapis.com/fcm/send/lubuk-mock-endpoint-' + Math.random().toString(36).substring(7),
          keys: {
            auth: btoa(Math.random().toString()),
            p256dh: btoa(Math.random().toString())
          }
        };

        // Save to database subscription registry
        await addPushSubscription(user.id, mockSubscription);

        // Send a celebratory notification
        await triggerMockNotification(
          user.id,
          'Notifications Enabled! 🎣',
          'You will now get alerts for trending fishing spots and catch activity in your area.'
        );
      }
    } catch (e) {
      console.error('Failed to request notifications:', e);
    } finally {
      setLoading(false);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('lubuk_push_prompted', 'true');
    setVisible(false);
  };

  return (
    <Transition mounted={visible} transition="slide-down" duration={400} timingFunction="ease">
      {(styles) => (
        <Card
          shadow="md"
          padding="sm"
          radius="md"
          withBorder
          style={{
            ...styles,
            position: 'absolute',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            width: '90%',
            maxWidth: 400,
            borderColor: 'var(--mantine-color-indigo-4)'
          }}
        >
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <ThemeIcon variant="light" color="indigo" size="md" radius="md" mt={2}>
              <IconBellRinging size={18} />
            </ThemeIcon>
            <Stack gap={2} style={{ flexGrow: 1 }}>
              <Text fw={700} size="xs" c="indigo">Enable Spot Alerts</Text>
              <Text size="11px" c="dimmed">
                Get notified when anglers log record catches nearby or when fishing hot spots go active!
              </Text>
              <Group gap="xs" mt={8}>
                <Button 
                  size="xs" 
                  color="indigo" 
                  onClick={handleRequestPermission} 
                  loading={loading}
                  leftSection={<IconCheck size={12} />}
                >
                  Enable
                </Button>
                <Button size="xs" variant="subtle" color="gray" onClick={handleDismiss}>
                  Dismiss
                </Button>
              </Group>
            </Stack>
            <CloseButton size="sm" onClick={handleDismiss} />
          </Group>
        </Card>
      )}
    </Transition>
  );
}
