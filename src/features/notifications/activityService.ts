// ============================================================
// ACTIVITY SERVICE - Activity Feed & Events
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { ActivityEvent, ActivityEventType } from '@/lib/types';

const supabase = createClient();

export const activityService = {
  /**
   * Log an activity event
   */
  async logActivity(
    actorId: string,
    eventType: ActivityEventType,
    subjectId?: string,
    subjectUserId?: string
  ): Promise<ActivityEvent | null> {
    try {
      const { data, error } = await supabase
        .from('activity_events')
        .insert([
          {
            actor_id: actorId,
            event_type: eventType,
            subject_id: subjectId || null,
            subject_user_id: subjectUserId || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  },

  /**
   * Get user's activity (catches, follows, etc.)
   */
  async getUserActivity(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    try {
      const { data: events, error: eventsError } = await supabase
        .from('activity_events')
        .select(
          `
          *,
          actorProfile:actor_id(id, display_name, avatar_url),
          subjectProfile:subject_user_id(id, display_name, avatar_url)
        `
        )
        .eq('actor_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (eventsError) throw eventsError;
      return events || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  },

  /**
   * Get activity feed for a user (from people they follow)
   */
  async getFollowingActivityFeed(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    try {
      // Get list of users this user follows
      const { data: following, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (followError) throw followError;

      const followingIds = following?.map((f) => f.following_id) || [];
      if (followingIds.length === 0) return [];

      // Get activity from those users
      const { data: events, error: eventsError } = await supabase
        .from('activity_events')
        .select(
          `
          *,
          actorProfile:actor_id(id, display_name, avatar_url),
          subjectProfile:subject_user_id(id, display_name, avatar_url)
        `
        )
        .in('actor_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (eventsError) throw eventsError;
      return events || [];
    } catch (error) {
      console.error('Error fetching following activity:', error);
      return [];
    }
  },

  /**
   * Get recent activity (global feed)
   */
  async getGlobalActivity(limit = 50, offset = 0): Promise<any[]> {
    try {
      const { data: events, error } = await supabase
        .from('activity_events')
        .select(
          `
          *,
          actorProfile:actor_id(id, display_name, avatar_url),
          subjectProfile:subject_user_id(id, display_name, avatar_url)
        `
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return events || [];
    } catch (error) {
      console.error('Error fetching global activity:', error);
      return [];
    }
  },

  /**
   * Get activity by type
   */
  async getActivityByType(
    eventType: ActivityEventType,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    try {
      const { data: events, error } = await supabase
        .from('activity_events')
        .select(
          `
          *,
          actorProfile:actor_id(id, display_name, avatar_url),
          subjectProfile:subject_user_id(id, display_name, avatar_url)
        `
        )
        .eq('event_type', eventType)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return events || [];
    } catch (error) {
      console.error('Error fetching activity by type:', error);
      return [];
    }
  },
};
