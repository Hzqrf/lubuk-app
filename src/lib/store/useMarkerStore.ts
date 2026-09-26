import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

// FishSpecies is now dynamic from the database
export type FishSpecies = string;

export interface MarkerData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  species: FishSpecies;
  note?: string;
  image_url?: string;
  timestamp: string; // mapping created_at to timestamp
}

interface MarkerStore {
  markers: MarkerData[];
  isLoading: boolean;
  selectedMarker: MarkerData | null;
  activeFilter: FishSpecies | 'All';
  fetchCatches: () => Promise<void>;
  addMarker: (marker: Omit<MarkerData, 'id' | 'timestamp'>) => Promise<void>;
  setSelectedMarker: (marker: MarkerData | null) => void;
  setActiveFilter: (filter: string | 'All') => void;
}

const supabase = createClient();

export const useMarkerStore = create<MarkerStore>((set, get) => ({
  markers: [],
  isLoading: false,
  selectedMarker: null,
  activeFilter: 'All',

  fetchCatches: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('catches')
        .select('*');
      
      if (error) throw error;
      
      const formattedMarkers: MarkerData[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        latitude: item.latitude,
        longitude: item.longitude,
        species: item.fish_species as FishSpecies,
        note: item.note,
        image_url: item.image_url,
        timestamp: item.created_at,
      }));

      set({ markers: formattedMarkers });
    } catch (error) {
      console.error('Error fetching catches:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addMarker: async (markerData) => {
    try {
      const { data, error } = await supabase
        .from('catches')
        .insert({
          user_id: markerData.user_id,
          latitude: markerData.latitude,
          longitude: markerData.longitude,
          fish_species: markerData.species,
          note: markerData.note,
          image_url: markerData.image_url,
        })
        .select()
        .single();

      if (error) throw error;

      const newMarker: MarkerData = {
        id: data.id,
        user_id: data.user_id,
        latitude: data.latitude,
        longitude: data.longitude,
        species: data.fish_species as FishSpecies,
        note: data.note,
        image_url: data.image_url,
        timestamp: data.created_at,
      };

      set((state) => ({ markers: [...state.markers, newMarker] }));
    } catch (error) {
      console.error('Error adding catch:', error);
      throw error;
    }
  },

  setSelectedMarker: (marker) => set({ selectedMarker: marker }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
