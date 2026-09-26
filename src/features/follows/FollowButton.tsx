// ============================================================
// FOLLOW BUTTON - Reusable Follow/Unfollow Component
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { Button, Tooltip, Loader } from '@mantine/core';
import { IconUserPlus, IconUserCheck } from '@tabler/icons-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { followService } from '@/features/follows/followService';

interface FollowButtonProps {
  userId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'default' | 'outline' | 'subtle';
  fullWidth?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  size = 'sm',
  variant = 'filled',
  fullWidth = false,
  onFollowChange,
}: FollowButtonProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { following, toggleFollow } = useSocialStore();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Check initial follow status
  useEffect(() => {
    if (!currentUser || currentUser.id === userId) {
      setIsOwnProfile(true);
      return;
    }

    const checkFollow = async () => {
      const isFollowingUser = await followService.isFollowing(
        currentUser.id,
        userId
      );
      setIsFollowing(isFollowingUser);
    };

    checkFollow();
  }, [currentUser, userId]);

  // Update when store changes
  useEffect(() => {
    setIsFollowing(following.has(userId));
  }, [following, userId]);

  if (isOwnProfile) {
    return null; // Don't show follow button on own profile
  }

  if (!currentUser) {
    return (
      <Tooltip label="Sign in to follow">
        <Button
          disabled
          size={size}
          variant={variant}
          fullWidth={fullWidth}
          leftSection={<IconUserPlus size={16} />}
        >
          Sign in
        </Button>
      </Tooltip>
    );
  }

  const handleToggleFollow = async () => {
    setIsLoading(true);
    try {
      const newFollowing = await toggleFollow(currentUser.id, userId);
      setIsFollowing(newFollowing);
      onFollowChange?.(newFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      loading={isLoading}
      variant={isFollowing ? 'default' : variant}
      size={size}
      fullWidth={fullWidth}
      leftSection={
        isLoading ? <Loader size={16} /> : isFollowing ? (
          <IconUserCheck size={16} />
        ) : (
          <IconUserPlus size={16} />
        )
      }
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}

// ============================================================
// FOLLOW STATS - Display follower/following counts
// ============================================================

interface FollowStatsProps {
  userId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

export function FollowStats({
  userId,
  size = 'sm',
  layout = 'horizontal',
}: FollowStatsProps) {
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const followStats = await followService.getFollowStats(userId);
        setStats(followStats);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const StatItem = ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: 'var(--mantine-font-size-lg)' }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--mantine-font-size-sm)', color: 'var(--mantine-color-gray-6)' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: layout === 'horizontal' ? 'space-around' : 'flex-start',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
      }}
    >
      <StatItem label="Followers" value={stats.followers} />
      <StatItem label="Following" value={stats.following} />
    </div>
  );
}
