// ============================================================
// FOLLOWS SERVICE - Follow System & Social Graph
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { Follow, Profile } from '@/lib/types';

const supabase = createClient();

export const followService = {
  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<Follow | null> {
    try {
      // Prevent self-follow
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      const { data, error } = await supabase
        .from('follows')
        .insert([
          {
            follower_id: followerId,
            following_id: followingId,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - already following
          throw new Error('Already following this user');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit = 50, offset = 0): Promise<Profile[]> {
    try {
      // Get follower IDs
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (followError) throw followError;

      const followerIds = followData?.map((f) => f.follower_id) || [];
      if (followerIds.length === 0) return [];

      // Get follower profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followerIds);

      if (profileError) throw profileError;
      return profiles || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  },

  /**
   * Get user's following
   */
  async getFollowing(userId: string, limit = 50, offset = 0): Promise<Profile[]> {
    try {
      // Get following IDs
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (followError) throw followError;

      const followingIds = followData?.map((f) => f.following_id) || [];
      if (followingIds.length === 0) return [];

      // Get following profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followingIds);

      if (profileError) throw profileError;
      return profiles || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  },

  /**
   * Get follow statistics for a user
   */
  async getFollowStats(userId: string) {
    try {
      // Get follower count
      const { count: followerCount, error: followerError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followerError || followingError) {
        throw followerError || followingError;
      }

      return {
        followers: followerCount || 0,
        following: followingCount || 0,
      };
    } catch (error) {
      console.error('Error fetching follow stats:', error);
      return { followers: 0, following: 0 };
    }
  },

  /**
   * Get following feed (catches from users you follow)
   */
  async getFollowingFeed(userId: string, limit = 20, offset = 0): Promise<any[]> {
    try {
      // Get IDs of users this user follows
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (followError) throw followError;

      const followingIds = followData?.map((f) => f.following_id) || [];

      if (followingIds.length === 0) {
        return [];
      }

      // Get catches from following users
      const { data: catches, error: catchError } = await supabase
        .from('catches')
        .select('*')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (catchError) throw catchError;

      if (!catches || catches.length === 0) return [];

      // Get profiles for these catches
      const userIds = [...new Set(catches.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Combine and return
      return catches.map((c) => ({
        ...c,
        profiles: profileMap[c.user_id] || {},
      }));
    } catch (error) {
      console.error('Error fetching following feed:', error);
      return [];
    }
  },

  /**
   * Get suggested users to follow (not yet following, sorted by follower count)
   */
  async getSuggestedUsers(userId: string, limit = 10): Promise<Profile[]> {
    try {
      // Get list of users already following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followingIds = following?.map((f) => f.following_id) || [];

      // Get suggested users
      const query = supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .order('total_followers', { ascending: false })
        .limit(limit + followingIds.length);

      if (followingIds.length > 0) {
        query.not('id', 'in', `(${followingIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data?.slice(0, limit) || [];
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      return [];
    }
  },
};
