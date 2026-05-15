'use client';

import { useState } from 'react';
import { ActionIcon, Stack, Tooltip, Avatar, Menu, Modal, Button, Text } from '@mantine/core';
import { IconCurrentLocation, IconPlus, IconMoon, IconSun, IconBrandGoogleFilled } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface FloatingActionsProps {
  onLocateMe: () => void;
  onAddMarker: () => void;
  isAddingMode: boolean;
  isLocating?: boolean;
}

export function FloatingActions({ onLocateMe, onAddMarker, isAddingMode, isLocating }: FloatingActionsProps) {
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

      {/* Bottom right floating actions - Map Controls */}
      <Stack style={{ position: 'absolute', bottom: 32, right: 16, zIndex: 10 }} gap="sm">
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
