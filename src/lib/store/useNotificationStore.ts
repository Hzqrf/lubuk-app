import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  addPushSubscription: (userId: string, subscription: any) => Promise<void>;
  triggerMockNotification: (userId: string, title: string, body: string) => Promise<void>;
}

const supabase = createClient();

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items: NotificationItem[] = data || [];
      const unread = items.filter(n => !n.is_read).length;

      set({ notifications: items, unreadCount: unread });
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      const updated = get().notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      const unread = updated.filter(n => !n.is_read).length;

      set({ notifications: updated, unreadCount: unread });
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      const updated = get().notifications.map(n => ({ ...n, is_read: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  },

  addPushSubscription: async (userId, subscription) => {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          subscription: subscription,
        });

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }
    } catch (e) {
      console.error('Failed to save push subscription:', e);
    }
  },

  triggerMockNotification: async (userId, title, body) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          body,
          data: { mock: true },
        })
        .select()
        .single();

      if (error) throw error;

      const updated = [data as NotificationItem, ...get().notifications];
      const unread = updated.filter(n => !n.is_read).length;
      
      set({ notifications: updated, unreadCount: unread });

      // Trigger browser notification if supported and allowed
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch (e) {
      console.error('Failed to trigger mock notification:', e);
    }
  }
}));
