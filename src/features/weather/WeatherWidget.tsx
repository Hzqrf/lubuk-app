'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, Grid, Box, ThemeIcon, Skeleton, ActionIcon, Alert, SimpleGrid } from '@mantine/core';
import { 
  IconSun, 
  IconCloudRain, 
  IconWind, 
  IconDroplet, 
  IconGauge, 
  IconRefresh, 
  IconAlertCircle,
  IconClock
} from '@tabler/icons-react';
import { format } from 'date-fns';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  weatherData?: WeatherDataPayload | null;
  loading?: boolean;
  error?: string | null;
  cachedTime?: string | null;
  onRefresh?: () => void;
}

export interface WeatherDataPayload {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    rain: number;
    weather_code: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
}

export function getWeatherDescription(code: number): { text: string; icon: React.ReactNode; color: string } {
  if (code === 0) return { text: 'Clear Sky', icon: <IconSun size={24} />, color: 'orange' };
  if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', icon: <IconSun size={24} />, color: 'yellow' };
  if (code === 45 || code === 48) return { text: 'Foggy', icon: <IconSun size={24} />, color: 'gray' };
  if (code >= 51 && code <= 55) return { text: 'Light Drizzle', icon: <IconCloudRain size={24} />, color: 'blue' };
  if (code >= 61 && code <= 65) return { text: 'Rainy', icon: <IconCloudRain size={24} />, color: 'blue' };
  if (code >= 80 && code <= 82) return { text: 'Rain Showers', icon: <IconCloudRain size={24} />, color: 'blue' };
  if (code >= 95) return { text: 'Thunderstorm', icon: <IconCloudRain size={24} />, color: 'red' };
  return { text: 'Overcast', icon: <IconSun size={24} />, color: 'indigo' };
}

export function WeatherWidget({ 
  latitude, 
  longitude,
  weatherData,
  loading: externalLoading,
  error: externalError,
  cachedTime: externalCachedTime,
  onRefresh
}: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedTime, setCachedTime] = useState<string | null>(null);

  const isControlled = weatherData !== undefined;

  const fetchWeather = async () => {
    if (isControlled) {
      if (onRefresh) onRefresh();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
      if (!res.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const payload = await res.json();
      setData(payload.data);
      if (payload.cached) {
        setCachedTime(payload.timestamp);
      } else {
        setCachedTime(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to retrieve weather. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isControlled) {
      fetchWeather();
    }
  }, [latitude, longitude, isControlled]);

  const activeLoading = isControlled ? !!externalLoading : loading;
  const activeError = isControlled ? externalError : error;
  const activeData = isControlled ? weatherData : data;
  const activeCachedTime = isControlled ? externalCachedTime : cachedTime;

  if (activeLoading) {
    return (
      <Card shadow="sm" padding="md" radius="lg" withBorder>
        <Stack gap="sm">
          <Skeleton height={20} width="60%" />
          <Grid>
            <Grid.Col span={6}><Skeleton height={80} radius="md" /></Grid.Col>
            <Grid.Col span={6}><Skeleton height={80} radius="md" /></Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={3}><Skeleton height={40} /></Grid.Col>
            <Grid.Col span={3}><Skeleton height={40} /></Grid.Col>
            <Grid.Col span={3}><Skeleton height={40} /></Grid.Col>
            <Grid.Col span={3}><Skeleton height={40} /></Grid.Col>
          </Grid>
        </Stack>
      </Card>
    );
  }

  if (activeError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Weather Error" color="red" radius="md">
        <Text size="sm">{activeError}</Text>
        <ActionIcon variant="subtle" color="red" size="sm" mt="xs" onClick={fetchWeather}>
          <IconRefresh size={16} />
        </ActionIcon>
      </Alert>
    );
  }

  if (!activeData) return null;

  const current = activeData.current;
  const desc = getWeatherDescription(current.weather_code);

  return (
    <Card shadow="sm" padding="md" radius="lg" withBorder style={{ overflow: 'hidden' }}>
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon variant="light" color={desc.color} size="md" radius="md">
              {desc.icon}
            </ThemeIcon>
            <Text fw={600} size="sm">Weather & Conditions</Text>
          </Group>
          <Group gap="xs">
            {activeCachedTime && (
              <Group gap={4} title="Cached data">
                <IconClock size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="10px" c="dimmed">
                  {format(new Date(activeCachedTime), 'HH:mm')}
                </Text>
              </Group>
            )}
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={fetchWeather}>
              <IconRefresh size={14} />
            </ActionIcon>
          </Group>
        </Group>

        <Grid align="center" py="xs">
          <Grid.Col span={6}>
            <Stack gap={0}>
              <Text size="2.5rem" fw={800} style={{ letterSpacing: '-1.5px', lineHeight: 1 }}>
                {Math.round(current.temperature_2m)}°C
              </Text>
              <Text size="xs" c="dimmed">Feels like {Math.round(current.apparent_temperature)}°C</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Stack gap={2} align="flex-end">
              <Text fw={700} size="sm" color={desc.color}>{desc.text}</Text>
              <Text size="xs" c="dimmed">Spot Telemetry</Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <SimpleGrid cols={2} spacing="xs">
          <Card padding="xs" radius="md" bg="var(--mantine-color-gray-0)" style={{ borderRadius: 'var(--mantine-radius-md)' }} withBorder={false}>
            <Group gap="xs">
              <IconWind size={18} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <Box>
                <Text size="10px" c="dimmed" fw={600} style={{ textTransform: 'uppercase' }}>Wind</Text>
                <Text size="xs" fw={700}>{Math.round(current.wind_speed_10m)} km/h</Text>
              </Box>
            </Group>
          </Card>
          <Card padding="xs" radius="md" bg="var(--mantine-color-gray-0)" style={{ borderRadius: 'var(--mantine-radius-md)' }} withBorder={false}>
            <Group gap="xs">
              <IconDroplet size={18} style={{ color: 'var(--mantine-color-teal-6)' }} />
              <Box>
                <Text size="10px" c="dimmed" fw={600} style={{ textTransform: 'uppercase' }}>Humidity</Text>
                <Text size="xs" fw={700}>{current.relative_humidity_2m}%</Text>
              </Box>
            </Group>
          </Card>
          <Card padding="xs" radius="md" bg="var(--mantine-color-gray-0)" style={{ borderRadius: 'var(--mantine-radius-md)' }} withBorder={false}>
            <Group gap="xs">
              <IconGauge size={18} style={{ color: 'var(--mantine-color-violet-6)' }} />
              <Box>
                <Text size="10px" c="dimmed" fw={600} style={{ textTransform: 'uppercase' }}>Pressure</Text>
                <Text size="xs" fw={700}>{Math.round(current.pressure_msl)} hPa</Text>
              </Box>
            </Group>
          </Card>
          <Card padding="xs" radius="md" bg="var(--mantine-color-gray-0)" style={{ borderRadius: 'var(--mantine-radius-md)' }} withBorder={false}>
            <Group gap="xs">
              <IconCloudRain size={18} style={{ color: 'var(--mantine-color-red-6)' }} />
              <Box>
                <Text size="10px" c="dimmed" fw={600} style={{ textTransform: 'uppercase' }}>Rain</Text>
                <Text size="xs" fw={700}>{current.rain} mm</Text>
              </Box>
            </Group>
          </Card>
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
