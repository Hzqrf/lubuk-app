// ============================================================
// SOCIAL STORE - Comprehensive Social Interactions
// ============================================================

import { create } from 'zustand';
import { Like, Comment as CommentType, Notification } from '@/lib/types';
import { followService } from '@/features/follows/followService';
import { likesService } from '@/features/likes/likesService';
import { commentsService } from '@/features/comments/commentsService';
import { notificationsService } from '@/features/notifications/notificationsService';
import { createClient } from '@/lib/supabase/client';

export interface Comment {
  id: string;
  user_id: string;
  catch_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface SocialStore {
  // Follow state
  following: Set<string>;
  followers: Map<string, number>;
  
  // Like state
  likes: Record<string, Like[]>;
  
  // Comment state
  comments: Record<string, Comment[]>;
  
  // Notification state
  notifications: Notification[];
  unreadCount: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;

  // Follow actions
  fetchFollowing: (userId: string) => Promise<void>;
  toggleFollow: (userId: string, targetId: string) => Promise<boolean>;
  
  // Like actions
  fetchLikes: (catchId: string) => Promise<void>;
  toggleLike: (catchId: string, userId: string) => Promise<void>;
  
  // Comment actions
  fetchComments: (catchId: string) => Promise<void>;
  addComment: (catchId: string, userId: string, content: string, profile: { display_name: string, avatar_url: string | null }) => Promise<void>;
  deleteComment: (commentId: string, catchId: string, userId: string) => Promise<void>;
  
  // Notification actions
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  
  // Clear state
  reset: () => void;
}

const supabase = createClient();

export const useSocialStore = create<SocialStore>((set, get) => ({
  // Initial state
  following: new Set(),
  followers: new Map(),
  likes: {},
  comments: {},
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // ============================================================
  // FOLLOW ACTIONS
  // ============================================================
  fetchFollowing: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const followingProfiles = await followService.getFollowing(userId);
      const followingIds = new Set(followingProfiles.map((p) => p.id));
      set({ following: followingIds, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  toggleFollow: async (userId: string, targetId: string) => {
    try {
      const isFollowing = get().following.has(targetId);
      
      if (isFollowing) {
        await followService.unfollowUser(userId, targetId);
        const newFollowing = new Set(get().following);
        newFollowing.delete(targetId);
        set({ following: newFollowing });
      } else {
        await followService.followUser(userId, targetId);
        const newFollowing = new Set(get().following);
        newFollowing.add(targetId);
        set({ following: newFollowing });
      }
      
      return !isFollowing;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // ============================================================
  // LIKE ACTIONS
  // ============================================================
  fetchLikes: async (catchId: string) => {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('catch_id', catchId);
    
    if (!error && data) {
      set((state) => ({
        likes: { ...state.likes, [catchId]: data }
      }));
    }
  },

  toggleLike: async (catchId: string, userId: string) => {
    const currentLikes = get().likes[catchId] || [];
    const hasLiked = currentLikes.find((l) => l.user_id === userId);

    // Optimistic UI update
    if (hasLiked) {
      set((state) => ({
        likes: {
          ...state.likes,
          [catchId]: state.likes[catchId].filter((l) => l.user_id !== userId)
        }
      }));
      // Database request
      await supabase.from('likes').delete().eq('catch_id', catchId).eq('user_id', userId);
    } else {
      const newLike = { id: 'temp', catch_id: catchId, user_id: userId } as Like;
      set((state) => ({
        likes: {
          ...state.likes,
          [catchId]: [...currentLikes, newLike]
        }
      }));
      // Database request
      await supabase.from('likes').insert({ catch_id: catchId, user_id: userId });
    }
  },

  // ============================================================
  // COMMENT ACTIONS
  // ============================================================
  fetchComments: async (catchId: string) => {
    // Step 1: Fetch Comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('catch_id', catchId)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return;
    }

    if (!commentsData || commentsData.length === 0) {
      set((state) => ({
        comments: { ...state.comments, [catchId]: [] }
      }));
      return;
    }

    // Step 2: Fetch Profiles for these comments
    const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.warn('Error fetching profiles for comments:', profilesError);
    }

    const profileMap = (profilesData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const cleanData: Comment[] = commentsData.map((c: any) => ({
      ...c,
      profiles: profileMap[c.user_id] || {
        display_name: 'Anonymous Angler',
        avatar_url: null
      }
    }));

    set((state) => ({
      comments: { ...state.comments, [catchId]: cleanData }
    }));
  },

  addComment: async (catchId: string, userId: string, content: string, profile: { display_name: string, avatar_url: string | null }) => {
    // Optimistic UI update
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      catch_id: catchId,
      user_id: userId,
      content,
      created_at: new Date().toISOString(),
      profiles: profile
    };

    set((state) => ({
      comments: {
        ...state.comments,
        [catchId]: [...(state.comments[catchId] || []), tempComment]
      }
    }));

    const { error } = await supabase
      .from('comments')
      .insert({ catch_id: catchId, user_id: userId, content });
      
    if (!error) {
      get().fetchComments(catchId); // Re-fetch to get real ID and exact timestamp
    }
  },

  deleteComment: async (commentId: string, catchId: string, userId: string) => {
    // Optimistic update
    set((state) => ({
      comments: {
        ...state.comments,
        [catchId]: state.comments[catchId].filter((c) => c.id !== commentId)
      }
    }));
    await supabase.from('comments').delete().eq('id', commentId);
  },

  // ============================================================
  // NOTIFICATION ACTIONS
  // ============================================================
  fetchNotifications: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && notifications) {
        const unreadCount = notifications.filter((n) => !n.is_read).length;
        set({ notifications: notifications as any, unreadCount, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      // Update local state
      const newNotifications = get().notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      const newUnreadCount = newNotifications.filter((n) => !n.is_read).length;
      set({ notifications: newNotifications, unreadCount: newUnreadCount });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // ============================================================
  // UTILITY
  // ============================================================
  reset: () => {
    set({
      following: new Set(),
      followers: new Map(),
      likes: {},
      comments: {},
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    });
  },
}));
