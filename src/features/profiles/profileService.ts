// ============================================================
// PROFILE SERVICE - User Profile Management
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { Profile, ProfileFormData } from '@/lib/types';

const supabase = createClient();

export const profileService = {
  /**
   * Fetch a user profile by ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  /**
   * Fetch multiple profiles
   */
  async getProfiles(userIds: string[]): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
  },

  /**
   * Search profiles by display name
   */
  async searchProfiles(query: string, limit = 10): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<ProfileFormData>
  ): Promise<Profile | null> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('catches-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('catches-images').getPublicUrl(filePath);

      // Update profile with new avatar URL
      await this.updateProfile(userId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return null;

      // Get total likes received
      const { data: likesData } = await supabase
        .from('likes')
        .select('id')
        .in(
          'catch_id',
          (
            await supabase.from('catches').select('id').eq('user_id', userId)
          ).data?.map((c) => c.id) || []
        );

      return {
        ...profile,
        totalLikesReceived: likesData?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  },

  /**
   * Get user's recent catches
   */
  async getUserCatches(userId: string, limit = 12): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('catches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user catches:', error);
      return [];
    }
  },
};
