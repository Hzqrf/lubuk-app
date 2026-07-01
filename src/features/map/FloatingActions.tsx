'use client';

import { useState } from 'react';
import { ActionIcon, Stack, Tooltip, Avatar, Menu, Modal, Button, Text } from '@mantine/core';
import { 
  IconCurrentLocation, 
  IconPlus, 
  IconMoon, 
  IconSun, 
  IconBrandGoogleFilled,
  IconFlame,
  IconRadar,
  IconMap,
  IconCloud,
  IconCompass,
  IconFish,
  IconClock,
  IconTrophy,
  IconMedal,
  IconStar
} from '@tabler/icons-react';
import Link from 'next/link';
import { useMantineColorScheme } from '@mantine/core';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface FloatingActionsProps {
  onLocateMe: () => void;
  onAddMarker: () => void;
  isAddingMode: boolean;
  isLocating?: boolean;
  
  // New features triggers
  heatmapVisible: boolean;
  onToggleHeatmap: () => void;
  onOpenNearby: () => void;
  onOpenTrending: () => void;
  onOpenWeather: () => void;
}

export function FloatingActions({ 
  onLocateMe, 
  onAddMarker, 
  isAddingMode, 
  isLocating,
  heatmapVisible,
  onToggleHeatmap,
  onOpenNearby,
  onOpenTrending,
  onOpenWeather
}: FloatingActionsProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  const user = useAuthStore((state) => state.user);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signOut = useAuthStore((state) => state.signOut);

  const [loginModalOpened, setLoginModalOpened] = useState(false);

  const handleAddMarkerClick = () => {
    if (!user) {
      setLoginModalOpened(true);
      return;
    }
    onAddMarker();
  };

  return (
    <>
      {/* Top right floating actions - Profile & Theme */}
      <Stack style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }} gap="sm">
        {user ? (
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <Avatar
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name}
                radius="xl"
                size="md"
                style={{ cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '2px solid white' }}
              />
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Logged in as {user.user_metadata.full_name}</Menu.Label>
              <Menu.Item color="red" onClick={() => signOut()}>
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Tooltip label="Sign In" position="left">
            <ActionIcon
              size="xl"
              radius="xl"
              variant="default"
              onClick={() => setLoginModalOpened(true)}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              <IconBrandGoogleFilled size={20} />
            </ActionIcon>
          </Tooltip>
        )}

        <Tooltip label="Toggle Theme" position="left">
          <ActionIcon
            size="xl"
            radius="xl"
            variant="default"
            onClick={() => toggleColorScheme()}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {dark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
        </Tooltip>
      </Stack>

      {/* Bottom LEFT floating actions - Intelligence Layers & Discovery */}
      <Stack style={{ position: 'absolute', bottom: 72, left: 16, zIndex: 10 }} gap="sm">
        <Tooltip label="Toggle Heatmap" position="right">
          <ActionIcon
            size="xl"
            radius="xl"
            color={heatmapVisible ? 'orange' : 'gray'}
            variant={heatmapVisible ? 'filled' : 'default'}
            onClick={onToggleHeatmap}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <IconMap size={22} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Weather & Solunar" position="right">
          <ActionIcon
            size="xl"
            radius="xl"
            variant="default"
            onClick={onOpenWeather}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <IconCloud size={22} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Catches Nearby" position="right">
          <ActionIcon
            size="xl"
            radius="xl"
            variant="default"
            onClick={onOpenNearby}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <IconRadar size={22} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Trending Spots" position="right">
          <ActionIcon
            size="xl"
            radius="xl"
            variant="default"
            onClick={onOpenTrending}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <IconFlame size={22} />
          </ActionIcon>
        </Tooltip>
      </Stack>

      {/* Bottom right floating actions - Map Controls */}
      <Stack style={{ position: 'absolute', bottom: 72, right: 16, zIndex: 10 }} gap="sm">
        <Menu position="left-end" shadow="lg" radius="md">
          <Menu.Target>
            <Tooltip label="Community Hub" position="left">
              <ActionIcon
                size="xl"
                radius="xl"
                variant="default"
                color="teal"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                <IconCompass size={24} className="text-teal-600 dark:text-teal-400" />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Community</Menu.Label>
            <Menu.Item component={Link} href="/species" leftSection={<IconFish size={16} className="text-blue-500" />}>
              FishDex
            </Menu.Item>
            <Menu.Item component={Link} href="/sessions" leftSection={<IconClock size={16} className="text-orange-500" />}>
              Sessions
            </Menu.Item>
            <Menu.Item component={Link} href="/tournaments" leftSection={<IconTrophy size={16} className="text-yellow-500" />}>
              Tournaments
            </Menu.Item>
            <Menu.Item component={Link} href="/leaderboards" leftSection={<IconMedal size={16} className="text-indigo-500" />}>
              Leaderboards
            </Menu.Item>
            <Menu.Item component={Link} href="/reputation" leftSection={<IconStar size={16} className="text-green-500" />}>
              Reputation
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Tooltip label="Locate Me" position="left">
          <ActionIcon
            size="xl"
            radius="xl"
            variant="default"
            onClick={onLocateMe}
            loading={isLocating}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <IconCurrentLocation size={24} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Add Catch" position="left">
          <ActionIcon
            size="xl"
            radius="xl"
            color={isAddingMode ? 'red' : 'blue'}
            variant="filled"
            onClick={handleAddMarkerClick}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {isAddingMode ? <IconPlus style={{ transform: 'rotate(45deg)', transition: 'transform 0.2s' }} size={24} /> : <IconPlus size={24} style={{ transition: 'transform 0.2s' }} />}
          </ActionIcon>
        </Tooltip>
      </Stack>

      {/* Login Modal */}
      <Modal
        opened={loginModalOpened}
        onClose={() => setLoginModalOpened(false)}
        title={<Text fw={600} size="lg">Sign in to Lubuk</Text>}
        centered
        overlayProps={{ blur: 3, opacity: 0.5 }}
        radius="md"
      >
        <Stack gap="md" align="center" py="xl">
          <Text ta="center" c="dimmed">
            You need to be signed in to add your fish catches to the map.
          </Text>
          <Button
            leftSection={<IconBrandGoogleFilled size={18} />}
            size="md"
            variant="default"
            fullWidth
            onClick={() => {
              setLoginModalOpened(false);
              signInWithGoogle();
            }}
          >
            Continue with Google
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

