'use client';

import { useEffect } from 'react';
import { Drawer, Card, Text, Group, Stack, Badge, Box, Button, Progress, ThemeIcon, ScrollArea, Center } from '@mantine/core';
import { IconFlame, IconMessageCircle, IconMap2, IconTarget, IconActivity } from '@tabler/icons-react';
import { useTrendingStore, TrendingSpot } from '@/lib/store/useTrendingStore';
import { useMarkerStore } from '@/lib/store/useMarkerStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';

interface TrendingSpotsProps {
  opened: boolean;
  onClose: () => void;
  mapInstance: any;
}

export function TrendingSpots({ opened, onClose, mapInstance }: TrendingSpotsProps) {
  const markers = useMarkerStore((state) => state.markers);
  const likes = useSocialStore((state) => state.likes);
  const comments = useSocialStore((state) => state.comments);

  const spots = useTrendingStore((state) => state.trendingSpots);
  const computeTrendingSpots = useTrendingStore((state) => state.computeTrendingSpots);
  const activeSpotId = useTrendingStore((state) => state.activeSpotId);
  const setActiveSpotId = useTrendingStore((state) => state.setActiveSpotId);

  // Re-compute spots dynamically when markers or engagement metrics change
  useEffect(() => {
    if (opened && markers.length > 0) {
      computeTrendingSpots(markers, likes, comments);
    }
  }, [opened, markers, likes, comments, computeTrendingSpots]);

  const getHotnessBadge = (score: number) => {
    if (score >= 80) return { label: '🔥 Raging Hotspot', color: 'red' };
    if (score >= 40) return { label: '⚡ Active Spot', color: 'orange' };
    return { label: '👍 Fresh Spot', color: 'green' };
  };

  const handleSelectSpot = (spot: TrendingSpot) => {
    setActiveSpotId(spot.id);
    onClose();
    if (mapInstance) {
      mapInstance.flyTo([spot.latitude, spot.longitude], 15, { duration: 1.5 });
    }
  };

  const { getByName } = useSpeciesStore();
  const getSpeciesEmoji = (speciesVal: string) => {
    return getByName(speciesVal)?.emoji || '🎣';
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="md">Trending Hot Spots</Text>}
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
      {spots.length === 0 ? (
        <Center h={300} style={{ flexDirection: 'column' }}>
          <IconActivity size={48} style={{ color: 'var(--mantine-color-orange-5)', marginBottom: 12 }} />
          <Text fw={600} size="sm">No Hotspots Found</Text>
          <Text size="xs" c="dimmed" ta="center" px="xl" mt={4}>
            Catches need to be logged on the map for our spatial clustering algorithm to detect active hotspots!
          </Text>
        </Center>
      ) : (
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Our spatial algorithms aggregate geographical catches within a 1.5km grid and analyze social engagement (likes and comments) to determine the hottest spots.
          </Text>

          <Stack gap="sm">
            {spots.map((spot) => {
              const badge = getHotnessBadge(spot.hotnessScore);
              const isActive = activeSpotId === spot.id;

              return (
                <Card
                  key={spot.id}
                  withBorder
                  padding="md"
                  radius="lg"
                  style={{
                    borderColor: isActive ? 'var(--mantine-color-orange-5)' : 'var(--mantine-color-gray-3)',
                    boxShadow: isActive ? '0 0 10px rgba(247,103,7,0.15)' : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Stack gap={1}>
                        <Text fw={700} size="sm">{spot.name}</Text>
                        <Text size="10px" c="dimmed">
                          Coordinates: {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                        </Text>
                      </Stack>
                      <Badge color={badge.color} variant="filled" size="xs">
                        {badge.label}
                      </Badge>
                    </Group>

                    <Group gap="md" mt={2}>
                      <Group gap={4}>
                        <IconMap2 size={14} style={{ color: 'var(--mantine-color-blue-5)' }} />
                        <Text size="xs" fw={700}>{spot.catchesCount} {spot.catchesCount === 1 ? 'catch' : 'catches'}</Text>
                      </Group>
                      <Group gap={4}>
                        <IconMessageCircle size={14} style={{ color: 'var(--mantine-color-orange-5)' }} />
                        <Text size="xs" fw={700}>{spot.engagement} social comments & likes</Text>
                      </Group>
                    </Group>

                    <Box mt={4} p="xs" bg="var(--mantine-color-gray-0)" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
                      <Text size="10px" fw={700} c="dimmed" mb={4}>SPECIES COMPOSITION</Text>
                      <Group gap="xs">
                        {Object.entries(spot.speciesBreakdown).map(([species, count]) => (
                          <Badge key={species} color="blue" variant="light" size="xs">
                            {getSpeciesEmoji(species)} {species}: {count}
                          </Badge>
                        ))}
                      </Group>
                    </Box>

                    <Button
                      variant={isActive ? 'filled' : 'light'}
                      color={isActive ? 'orange' : 'blue'}
                      size="xs"
                      fullWidth
                      onClick={() => handleSelectSpot(spot)}
                      leftSection={<IconTarget size={14} />}
                      mt={4}
                    >
                      {isActive ? 'Highlighted on Map' : 'Focus on Map'}
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}
