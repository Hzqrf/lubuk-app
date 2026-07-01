// ============================================================
// COMMENTS SERVICE - Comment System
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { Comment, CommentWithProfile } from '@/lib/types';

const supabase = createClient();

export const commentsService = {
  /**
   * Add a comment to a catch
   */
  async addComment(
    userId: string,
    catchId: string,
    content: string
  ): Promise<Comment | null> {
    try {
      if (!content || content.trim().length === 0) {
        throw new Error('Comment cannot be empty');
      }

      if (content.length > 1000) {
        throw new Error('Comment too long (max 1000 characters)');
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            user_id: userId,
            catch_id: catchId,
            content: content.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      // Verify user owns the comment
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (fetchError) throw fetchError;

      if (comment?.user_id !== userId) {
        throw new Error('Unauthorized: can only delete own comments');
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  /**
   * Get all comments for a catch
   */
  async getCommentsForCatch(catchId: string): Promise<CommentWithProfile[]> {
    try {
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(
          `
          *,
          profiles:user_id(display_name, avatar_url)
        `
        )
        .eq('catch_id', catchId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      return (comments || []).map((comment: any) => ({
        ...comment,
        profiles: comment.profiles[0] || {
          display_name: 'Anonymous',
          avatar_url: null,
        },
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  /**
   * Get comment count for a catch
   */
  async getCommentCount(catchId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('catch_id', catchId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching comment count:', error);
      return 0;
    }
  },

  /**
   * Get user's comments
   */
  async getUserComments(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<CommentWithProfile[]> {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          profiles:user_id(display_name, avatar_url)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (comments || []).map((comment: any) => ({
        ...comment,
        profiles: comment.profiles[0] || {
          display_name: 'Anonymous',
          avatar_url: null,
        },
      }));
    } catch (error) {
      console.error('Error fetching user comments:', error);
      return [];
    }
  },

  /**
   * Get recent comments (for activity feed)
   */
  async getRecentComments(
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          catches:catch_id(*),
          profiles:user_id(id, display_name, avatar_url)
        `
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return comments || [];
    } catch (error) {
      console.error('Error fetching recent comments:', error);
      return [];
    }
  },
};
