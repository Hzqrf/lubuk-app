import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { MarkerData } from './useMarkerStore';

export interface FeedCatch extends MarkerData {
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

interface FeedStore {
  feed: FeedCatch[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  fetchFeed: (reset?: boolean) => Promise<void>;
}

const supabase = createClient();
const PAGE_SIZE = 10;

export const useFeedStore = create<FeedStore>((set, get) => ({
  feed: [],
  isLoading: false,
  hasMore: true,
  page: 0,

  fetchFeed: async (reset = false) => {
    const { page, feed, isLoading, hasMore } = get();
    
    if (isLoading || (!hasMore && !reset)) return;

    set({ isLoading: true });
    
    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Step 1: Fetch Catches
    const { data: catchesData, error: catchesError } = await supabase
      .from('catches')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (catchesError) {
      console.error('Error fetching feed catches:', catchesError);
      set({ isLoading: false });
      return;
    }

    if (!catchesData || catchesData.length === 0) {
      set({
        feed: reset ? [] : feed,
        hasMore: false,
        isLoading: false
      });
      return;
    }

    // Step 2: Fetch Profiles for these catches
    const userIds = [...new Set(catchesData.map((c: any) => c.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.warn('Error fetching profiles for feed, showing as anonymous:', profilesError);
    }

    // Map profiles back to catches
    const profileMap = (profilesData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const cleanData: FeedCatch[] = catchesData.map((item: any) => ({
      ...item,
      species: item.fish_species,
      timestamp: item.created_at,
      profiles: profileMap[item.user_id] || { 
        display_name: 'Anonymous Angler', 
        avatar_url: '' 
      }
    }));

    set({
      feed: reset ? cleanData : [...feed, ...cleanData],
      page: currentPage + 1,
      hasMore: catchesData.length === PAGE_SIZE,
      isLoading: false
    });
  }
}));
