'use client';

import { useState, useMemo, useEffect } from 'react';
import { Drawer, Card, Image, Text, Group, Stack, Badge, Slider, SegmentedControl, ActionIcon, ScrollArea, Box, Center, Loader, Button } from '@mantine/core';
import { IconMapPin, IconCalendar, IconFlame, IconNavigation, IconChevronRight, IconClick } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useMarkerStore, MarkerData } from '@/lib/store/useMarkerStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';

interface NearbyCatchesProps {
  opened: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
  mapInstance: any; // Leaflet map reference to flyTo
}

// Distance calculator (Haversine Formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function NearbyCatches({ opened, onClose, userCoords, mapInstance }: NearbyCatchesProps) {
  const markers = useMarkerStore((state) => state.markers);
  const setSelectedMarker = useMarkerStore((state) => state.setSelectedMarker);
  const likes = useSocialStore((state) => state.likes);
  const comments = useSocialStore((state) => state.comments);
  const species = useSpeciesStore((state) => state.species);
  const fetchSpecies = useSpeciesStore((state) => state.fetchSpecies);

  const [radius, setRadius] = useState<number>(25); // Default 25km radius
  const [sortBy, setSortBy] = useState<string>('distance'); // 'distance' | 'recency' | 'popularity'

  // Pre-fetch likes/comments counts for popularity metric if not already fetched
  const fetchLikes = useSocialStore((state) => state.fetchLikes);
  const fetchComments = useSocialStore((state) => state.fetchComments);

  useEffect(() => {
    // Fetch species on mount
    fetchSpecies();
  }, [fetchSpecies]);

  useEffect(() => {
    if (opened && markers.length > 0) {
      markers.forEach(m => {
        if (!likes[m.id]) fetchLikes(m.id);
        if (!comments[m.id]) fetchComments(m.id);
      });
    }
  }, [opened, markers, likes, comments, fetchLikes, fetchComments]);

  // Compute nearby items
  const nearbyCatches = useMemo(() => {
    if (!userCoords) return [];

    const computed = markers.map((m) => {
      const distance = getDistance(userCoords.lat, userCoords.lng, m.latitude, m.longitude);
      const likesCount = likes[m.id]?.length || 0;
      const commentsCount = comments[m.id]?.length || 0;
      const engagement = likesCount + commentsCount;

      return {
        ...m,
        distance,
        engagement,
      };
    });

    // Filter by radius
    const filtered = computed.filter((c) => c.distance <= radius);

    // Sort by criteria
    return filtered.sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance; // Closest first
      }
      if (sortBy === 'recency') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Newest first
      }
      if (sortBy === 'popularity') {
        return b.engagement - a.engagement; // Most engaged first
      }
      return 0;
    });
  }, [markers, userCoords, radius, sortBy, likes, comments]);

  const handleSelectCatch = (catchItem: MarkerData) => {
    setSelectedMarker(catchItem);
    onClose();
    if (mapInstance) {
      mapInstance.flyTo([catchItem.latitude, catchItem.longitude], 15, { duration: 1.5 });
    }
  };

  const getSpeciesEmoji = (speciesVal: string) => {
    return species.find((s) => s.name.toLowerCase() === speciesVal.toLowerCase())?.emoji || '🎣';
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="md">Explore Nearby Catches</Text>}
      position="right"
      size="md"
      styles={{
        header: {
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          paddingBottom: '12px',
          marginBottom: '16px'
        }
      }}
    >
      {!userCoords ? (
        <Center h={300} style={{ flexDirection: 'column' }}>
          <IconMapPin size={48} style={{ color: 'var(--mantine-color-blue-5)', marginBottom: 12 }} />
          <Text fw={600} size="sm">Location Access Required</Text>
          <Text size="xs" c="dimmed" ta="center" px="xl" mt={4}>
            Please enable browser location services and tap "Locate Me" on the map so we can calculate nearby catches.
          </Text>
        </Center>
      ) : (
        <Stack gap="md">
          {/* Radius control */}
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" fw={700}>Search Radius</Text>
              <Badge color="blue" variant="light">{radius} km</Badge>
            </Group>
            <Slider
              value={radius}
              onChange={setRadius}
              min={1}
              max={100}
              marks={[
                { value: 5, label: '5km' },
                { value: 25, label: '25km' },
                { value: 50, label: '50km' },
                { value: 100, label: '100km' },
              ]}
              mb="xl"
            />
          </Box>

          {/* Sort selection */}
          <Box>
            <Text size="xs" fw={700} mb={6}>Sort By</Text>
            <SegmentedControl
              value={sortBy}
              onChange={setSortBy}
              fullWidth
              size="xs"
              data={[
                { label: 'Closest', value: 'distance' },
                { label: 'Recent', value: 'recency' },
                { label: 'Popular', value: 'popularity' },
              ]}
            />
          </Box>

          {/* Catches listing */}
          <Box mt="xs">
            <Text size="xs" fw={700} c="dimmed" mb="sm">
              Showing {nearbyCatches.length} catches within {radius}km
            </Text>

            {nearbyCatches.length === 0 ? (
              <Center py={40} style={{ flexDirection: 'column' }}>
                <Text size="2rem">🤷‍♂️</Text>
                <Text size="sm" fw={600} mt="xs">No catches found in this area</Text>
                <Text size="xs" c="dimmed" mt={4}>Try expanding your search radius!</Text>
              </Center>
            ) : (
              <Stack gap="sm">
                {nearbyCatches.map((item) => (
                  <Card
                    key={item.id}
                    withBorder
                    padding="xs"
                    radius="md"
                    style={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onClick={() => handleSelectCatch(item)}
                  >
                    <Group gap="sm" wrap="nowrap">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          w={70}
                          h={70}
                          radius="md"
                          fit="cover"
                          fallbackSrc="https://placehold.co/100x100?text=Fish"
                        />
                      ) : (
                        <Box
                          w={70}
                          h={70}
                          style={{
                            background: 'var(--mantine-color-blue-0)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Text size="xl">{getSpeciesEmoji(item.species)}</Text>
                        </Box>
                      )}
                      
                      <Stack gap={2} style={{ flexGrow: 1, minWidth: 0 }}>
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="xs" fw={700} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getSpeciesEmoji(item.species)} {item.species}
                          </Text>
                          <Badge size="xs" color="gray" variant="outline">
                            {item.distance.toFixed(1)} km
                          </Badge>
                        </Group>
                        <Text size="11px" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.note || 'No description provided'}
                        </Text>
                        <Group gap="xs" mt={4}>
                          <Badge size="9px" color="blue" variant="light" leftSection={<IconCalendar size={10} />}>
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </Badge>
                          {item.engagement > 0 && (
                            <Badge size="9px" color="orange" variant="light" leftSection={<IconFlame size={10} />}>
                              {item.engagement} interactions
                            </Badge>
                          )}
                        </Group>
                      </Stack>

                      <ActionIcon variant="subtle" color="gray" size="sm" style={{ alignSelf: 'center' }}>
                        <IconChevronRight size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      )}
    </Drawer>
  );
}
