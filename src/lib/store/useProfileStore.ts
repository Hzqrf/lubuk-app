import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_catches: number;
  favorite_species: string | null;
  created_at: string;
}

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (id: string) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
}

const supabase = createClient();

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      set({ profile: data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      set({ profile: data });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}));
