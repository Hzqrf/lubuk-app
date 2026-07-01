// ============================================================
// NOTIFICATIONS SERVICE - Real-time Notifications
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { Notification, NotificationEventType, NotificationWithProfiles } from '@/lib/types';

const supabase = createClient();

export const notificationsService = {
  /**
   * Create a notification
   */
  async createNotification(
    recipientId: string,
    actorId: string,
    eventType: NotificationEventType,
    catchId?: string
  ): Promise<Notification | null> {
    try {
      // Don't notify user of their own actions
      if (recipientId === actorId) {
        return null;
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: recipientId,
            actor_id: actorId,
            event_type: eventType,
            catch_id: catchId || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  /**
   * Get user's notifications
   */
  async getNotifications(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<NotificationWithProfiles[]> {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(
          `
          *,
          actor:actor_id(id, display_name, avatar_url, total_followers),
          catch:catch_id(id, image_url, fish_species)
        `
        )
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (notifications || []).map((n: any) => ({
        ...n,
        actor: n.actor[0] || null,
        catch: n.catch[0] || null,
      })) as NotificationWithProfiles[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(userId: string, daysOld = 30): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', userId)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      return false;
    }
  },

  /**
   * Check for duplicate notification (prevent spam)
   */
  async hasDuplicateNotification(
    recipientId: string,
    actorId: string,
    eventType: NotificationEventType,
    catchId?: string,
    withinMinutes = 30
  ): Promise<boolean> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - withinMinutes);

      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('recipient_id', recipientId)
        .eq('actor_id', actorId)
        .eq('event_type', eventType)
        .gte('created_at', cutoffTime.toISOString());

      if (catchId) {
        // Can't chain eq directly, so filter in memory
        return (data || []).some((n) => n);
      }

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking duplicate notification:', error);
      return false;
    }
  },

  /**
   * Get notification summary
   */
  async getNotificationSummary(userId: string) {
    try {
      const [unreadCount, notifications] = await Promise.all([
        this.getUnreadCount(userId),
        this.getNotifications(userId, 50),
      ]);

      return {
        unreadCount,
        notifications,
      };
    } catch (error) {
      console.error('Error fetching notification summary:', error);
      return {
        unreadCount: 0,
        notifications: [],
      };
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: NotificationWithProfiles) => void
  ) {
    try {
      const subscription = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`,
          },
          async (payload: any) => {
            const notification = payload.new as Notification;

            // Fetch full notification with profiles
            const [actorData, catchData] = await Promise.all([
              supabase
                .from('profiles')
                .select('*')
                .eq('id', notification.actor_id)
                .single(),
              notification.catch_id
                ? supabase
                    .from('catches')
                    .select('*')
                    .eq('id', notification.catch_id)
                    .single()
                : Promise.resolve({ data: null }),
            ]);

            const fullNotification: NotificationWithProfiles = {
              ...notification,
              actor: actorData.data as any,
              catch: catchData.data as any,
            };

            callback(fullNotification);
          }
        )
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  },
};
