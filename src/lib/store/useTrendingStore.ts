import { create } from 'zustand';
import { MarkerData } from './useMarkerStore';

export interface TrendingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  catchesCount: number;
  engagement: number;
  hotnessScore: number;
  primarySpecies: string;
  speciesBreakdown: Record<string, number>;
}

interface TrendingStore {
  trendingSpots: TrendingSpot[];
  activeSpotId: string | null;
  computeTrendingSpots: (
    markers: MarkerData[],
    likes: Record<string, any[]>,
    comments: Record<string, any[]>
  ) => void;
  setActiveSpotId: (id: string | null) => void;
}

// Distance helper
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const useTrendingStore = create<TrendingStore>((set) => ({
  trendingSpots: [],
  activeSpotId: null,

  computeTrendingSpots: (markers, likes, comments) => {
    if (markers.length === 0) {
      set({ trendingSpots: [] });
      return;
    }

    const clusters: MarkerData[][] = [];
    const visited = new Set<string>();
    const CLUSTER_RADIUS_KM = 1.5;

    // Perform a simple DBSCAN/greedy grid clustering
    markers.forEach((marker) => {
      if (visited.has(marker.id)) return;

      const currentCluster: MarkerData[] = [marker];
      visited.add(marker.id);

      markers.forEach((other) => {
        if (visited.has(other.id)) return;

        const dist = getDistance(
          marker.latitude,
          marker.longitude,
          other.latitude,
          other.longitude
        );

        if (dist <= CLUSTER_RADIUS_KM) {
          currentCluster.push(other);
          visited.add(other.id);
        }
      });

      clusters.push(currentCluster);
    });

    // Formulate trending spot metrics for each cluster
    const spots: TrendingSpot[] = clusters.map((cluster, index) => {
      let latSum = 0;
      let lngSum = 0;
      let totalEngagement = 0;
      const speciesCount: Record<string, number> = {};

      cluster.forEach((m) => {
        latSum += m.latitude;
        lngSum += m.longitude;
        
        const likesCount = likes[m.id]?.length || 0;
        const commentsCount = comments[m.id]?.length || 0;
        totalEngagement += likesCount + commentsCount;

        speciesCount[m.species] = (speciesCount[m.species] || 0) + 1;
      });

      const avgLat = latSum / cluster.length;
      const avgLng = lngSum / cluster.length;

      // Find primary species in this hotspot
      let primarySpecies = 'Mixed';
      let maxCount = 0;
      Object.entries(speciesCount).forEach(([species, count]) => {
        if (count > maxCount) {
          maxCount = count;
          primarySpecies = species;
        }
      });

      // Calculate Hotness Score: catches weight (x15) + engagement weight (x3)
      const catchesCount = cluster.length;
      const hotnessScore = (catchesCount * 15) + (totalEngagement * 3);

      // Name spot dynamically
      const spotNames = [
        `${primarySpecies} Lagoon`,
        `Upper ${primarySpecies} Basin`,
        `${primarySpecies} Weed Bed`,
        `Lakeside ${primarySpecies} Cove`,
        `${primarySpecies} Point`,
      ];
      const spotName = spotNames[index % spotNames.length];

      return {
        id: `spot-${index}`,
        name: spotName,
        latitude: avgLat,
        longitude: avgLng,
        catchesCount,
        engagement: totalEngagement,
        hotnessScore,
        primarySpecies,
        speciesBreakdown: speciesCount,
      };
    });

    // Sort by hotness score descending
    const sortedSpots = spots.sort((a, b) => b.hotnessScore - a.hotnessScore);

    set({ trendingSpots: sortedSpots });
  },

  setActiveSpotId: (id) => set({ activeSpotId: id }),
}));
