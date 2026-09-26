'use client';

import { useState, useEffect, useMemo } from 'react';
import { Drawer, Text, Group, Stack, Badge, Box, ScrollArea, Center, Loader, ActionIcon } from '@mantine/core';
import { IconCloud, IconMapPin, IconRefresh, IconLocation } from '@tabler/icons-react';
import { WeatherWidget, WeatherDataPayload } from './WeatherWidget';
import { MoonPhaseWidget } from './MoonPhaseWidget';
import { PredictionWidget } from '@/features/prediction/PredictionWidget';

interface WeatherDrawerProps {
  opened: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
  mapInstance: any;
}

export function WeatherDrawer({ opened, onClose, userCoords, mapInstance }: WeatherDrawerProps) {
  const [data, setData] = useState<WeatherDataPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedTime, setCachedTime] = useState<string | null>(null);
  const [lastFetchedCoords, setLastFetchedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Compute active coordinates based on user GPS or current map center
  const activeCoords = useMemo(() => {
    if (!opened) return null;
    if (userCoords) return userCoords;
    if (mapInstance) {
      const center = mapInstance.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return null;
  }, [opened, userCoords, mapInstance]);

  const isUserGps = !!userCoords;

  const fetchWeather = async (coords: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lng}`);
      if (!res.ok) {
        throw new Error('Failed to fetch weather telemetry');
      }
      const payload = await res.json();
      setData(payload.data);
      if (payload.cached) {
        setCachedTime(payload.timestamp);
      } else {
        setCachedTime(null);
      }
      setLastFetchedCoords(coords);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to retrieve weather forecast.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened && activeCoords) {
      // Threshold check to prevent unnecessary requests on small pans (~500m)
      const shouldFetch = !lastFetchedCoords || 
        Math.abs(lastFetchedCoords.lat - activeCoords.lat) > 0.005 || 
        Math.abs(lastFetchedCoords.lng - activeCoords.lng) > 0.005;
      
      if (shouldFetch) {
        fetchWeather(activeCoords);
      }
    }
  }, [opened, activeCoords, lastFetchedCoords]);

  const handleRefresh = () => {
    if (activeCoords) {
      fetchWeather(activeCoords);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconCloud size={22} style={{ color: 'var(--mantine-color-blue-5)' }} />
          <Text fw={700} size="md">Weather & Fishing Forecast</Text>
        </Group>
      }
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
      {!activeCoords ? (
        <Center h={300} style={{ flexDirection: 'column' }}>
          <Loader size="md" color="blue" />
          <Text size="xs" c="dimmed" mt="sm">Initializing map coordinates...</Text>
        </Center>
      ) : (
        <Stack gap="md">
          {/* Header Coordinates/Location Label */}
          <Box p="xs" bg="var(--mantine-color-blue-0)" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                {isUserGps ? (
                  <IconLocation size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
                ) : (
                  <IconMapPin size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                )}
                <Box>
                  <Text size="11px" fw={700} c={isUserGps ? 'blue.7' : 'gray.7'}>
                    {isUserGps ? 'YOUR CURRENT GPS LOCATION' : 'MAP CENTER FORECAST'}
                  </Text>
                  <Text size="10px" c="dimmed" style={{ fontFamily: 'monospace' }}>
                    {activeCoords.lat.toFixed(4)}° N, {activeCoords.lng.toFixed(4)}° E
                  </Text>
                </Box>
              </Group>
              <ActionIcon variant="subtle" color="blue" onClick={handleRefresh} loading={loading}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>
          </Box>

          {/* Controlled Weather Display */}
          <WeatherWidget
            latitude={activeCoords.lat}
            longitude={activeCoords.lng}
            weatherData={data}
            loading={loading}
            error={error}
            cachedTime={cachedTime}
            onRefresh={handleRefresh}
          />

          {/* Solunar & Fishing Prediction */}
          {!loading && data && (
            <>
              <PredictionWidget
                latitude={activeCoords.lat}
                longitude={activeCoords.lng}
                weatherData={data}
              />

              <MoonPhaseWidget
                sunrise={data.daily?.sunrise?.[0]}
                sunset={data.daily?.sunset?.[0]}
              />
            </>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
