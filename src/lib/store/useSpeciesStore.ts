import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface SpeciesEntry {
  id: string;
  name: string;
  scientific_name: string | null;
  habitat: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string | null;
  image_url: string | null;
  color: string;
  emoji: string;
}

interface SpeciesStore {
  species: SpeciesEntry[];
  isLoaded: boolean;
  fetchSpecies: () => Promise<void>;
  getByName: (name: string) => SpeciesEntry | undefined;
}

const supabase = createClient();

const FALLBACK_SPECIES: SpeciesEntry[] = [
  { id: '1', name: 'Haruan', scientific_name: 'Channa striata', habitat: 'Freshwater, swamps, paddy fields', rarity: 'common', description: 'Common snakehead, an aggressive and hardy predator popular with lure anglers.', color: 'green', emoji: '🐟', image_url: null },
  { id: '2', name: 'Toman', scientific_name: 'Channa micropeltes', habitat: 'Lakes, rivers, reservoirs', rarity: 'uncommon', description: 'Giant snakehead, one of the most powerful freshwater fighters in Malaysia.', color: 'red', emoji: '🐡', image_url: null },
  { id: '3', name: 'Patin', scientific_name: 'Pangasius nasutus', habitat: 'Rivers, lakes', rarity: 'common', description: 'Malaysian catfish commonly targeted by bottom anglers using dough or shrimp paste.', color: 'blue', emoji: '🐋', image_url: null },
  { id: '4', name: 'Peacock Bass', scientific_name: 'Cichla ocellaris', habitat: 'Reservoirs, dams', rarity: 'uncommon', description: 'Introduced sport fish known for its explosive strikes and beautiful markings.', color: 'yellow', emoji: '🐠', image_url: null },
  { id: '5', name: 'Tilapia', scientific_name: 'Oreochromis niloticus', habitat: 'Ponds, rivers, rice fields', rarity: 'common', description: 'Widely found in still and slow-moving waters, a reliable catch for beginners.', color: 'teal', emoji: '🎣', image_url: null },
  { id: '6', name: 'Sebarau', scientific_name: 'Hampala macrolepidota', habitat: 'Clear, fast-flowing rivers', rarity: 'rare', description: 'Hampala barb, a prized sport fish that favours pristine jungle streams.', color: 'purple', emoji: '🎏', image_url: null },
  { id: '7', name: 'Kelah', scientific_name: 'Tor tambroides', habitat: 'Pristine jungle rivers', rarity: 'legendary', description: 'The Malaysian Mahseer – king of river fish, protected and revered by anglers.', color: 'orange', emoji: '👑', image_url: null }
];

export const useSpeciesStore = create<SpeciesStore>((set, get) => ({
  species: [],
  isLoaded: false,

  fetchSpecies: async () => {
    if (get().isLoaded) return; // Only fetch once
    try {
      const { data, error } = await supabase
        .from('species_dictionary')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ species: data && data.length > 0 ? (data as SpeciesEntry[]) : FALLBACK_SPECIES, isLoaded: true });
    } catch (err) {
      console.error('Failed to fetch species, using fallback:', err);
      set({ species: FALLBACK_SPECIES, isLoaded: true });
    }
  },

  getByName: (name: string) => {
    return get().species.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
  },
}));
