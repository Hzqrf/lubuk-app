'use client';

import { Group, UnstyledButton, Text, Box } from '@mantine/core';
import { IconMap, IconLayoutList, IconUser, IconBook, IconUsers } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { icon: <IconMap size={24} />, label: 'Map', href: '/' },
    { icon: <IconLayoutList size={24} />, label: 'Feed', href: '/feed' },
    { icon: <IconBook size={24} />, label: 'Journal', href: '/journal' },
    { icon: <IconUsers size={24} />, label: 'Groups', href: '/groups' },
    { icon: <IconUser size={24} />, label: 'Profile', href: '/profile' },
  ];

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'var(--mantine-color-body)',
        borderTop: '1px solid var(--mantine-color-default-border)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'safe-area-inset-bottom',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href || '###'));
        
        return (
          <UnstyledButton
            key={item.label}
            onClick={() => {
              if (item.href) router.push(item.href);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: isActive ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-dimmed)',
              flex: 1,
            }}
          >
            {item.icon}
            <Text size="xs" fw={isActive ? 600 : 400} mt={4}>
              {item.label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
