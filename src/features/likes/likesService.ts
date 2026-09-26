// ============================================================
// LIKES SERVICE - Like System
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { Like, LikeStats } from '@/lib/types';

const supabase = createClient();

export const likesService = {
  /**
   * Like a catch
   */
  async likeCatch(userId: string, catchId: string): Promise<Like | null> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .insert([
          {
            user_id: userId,
            catch_id: catchId,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Already liked this catch');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error liking catch:', error);
      throw error;
    }
  },

  /**
   * Unlike a catch
   */
  async unlikeCatch(userId: string, catchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('catch_id', catchId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unliking catch:', error);
      throw error;
    }
  },

  /**
   * Toggle like (like if not liked, unlike if liked)
   */
  async toggleLike(userId: string, catchId: string): Promise<boolean> {
    try {
      const isLiked = await this.hasLiked(userId, catchId);

      if (isLiked) {
        await this.unlikeCatch(userId, catchId);
        return false; // Now unliked
      } else {
        await this.likeCatch(userId, catchId);
        return true; // Now liked
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  /**
   * Check if user has liked a catch
   */
  async hasLiked(userId: string, catchId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('catch_id', catchId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return !!data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  },

  /**
   * Get all likes for a catch
   */
  async getLikesForCatch(catchId: string): Promise<Like[]> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('catch_id', catchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
  },

  /**
   * Get like statistics for a catch
   */
  async getLikeStats(
    catchId: string,
    userId?: string
  ): Promise<LikeStats> {
    try {
      // Get all likes
      const likes = await this.getLikesForCatch(catchId);

      // Check if user has liked
      const hasLiked = userId
        ? await this.hasLiked(userId, catchId)
        : false;

      return {
        count: likes.length,
        hasLiked,
        likedBy: likes.map((l) => l.user_id),
      };
    } catch (error) {
      console.error('Error fetching like stats:', error);
      return {
        count: 0,
        hasLiked: false,
        likedBy: [],
      };
    }
  },

  /**
   * Get users who liked a catch (with profiles)
   */
  async getLikeProfiles(catchId: string, limit = 10): Promise<any[]> {
    try {
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('catch_id', catchId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (likesError) throw likesError;

      const userIds = likes?.map((l) => l.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      return profiles || [];
    } catch (error) {
      console.error('Error fetching like profiles:', error);
      return [];
    }
  },

  /**
   * Get user's liked catches
   */
  async getUserLikedCatches(userId: string, limit = 20, offset = 0): Promise<any[]> {
    try {
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('catch_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (likesError) throw likesError;

      const catchIds = likes?.map((l) => l.catch_id) || [];
      if (catchIds.length === 0) return [];

      // Get catch details
      const { data: catches, error: catchError } = await supabase
        .from('catches')
        .select('*')
        .in('id', catchIds);

      if (catchError) throw catchError;
      return catches || [];
    } catch (error) {
      console.error('Error fetching user liked catches:', error);
      return [];
    }
  },
};
