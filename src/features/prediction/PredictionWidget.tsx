'use client';

import { useMemo } from 'react';
import { Card, Text, Group, Stack, Badge, Progress, Box, ThemeIcon, Accordion } from '@mantine/core';
import { IconChartLine, IconAlertCircle, IconActivity, IconInfoCircle } from '@tabler/icons-react';
import { calculateActivityPrediction } from './predictionService';
import { WeatherDataPayload } from '../weather/WeatherWidget';
import { useMarkerStore } from '@/lib/store/useMarkerStore';

interface PredictionWidgetProps {
  latitude: number;
  longitude: number;
  weatherData: WeatherDataPayload | null;
}

// Distance helper
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

export function PredictionWidget({ latitude, longitude, weatherData }: PredictionWidgetProps) {
  const markers = useMarkerStore((state) => state.markers);

  // Count catches within a 5km radius
  const localCatchesCount = useMemo(() => {
    return markers.filter(m => {
      const dist = getDistance(latitude, longitude, m.latitude, m.longitude);
      return dist <= 5;
    }).length;
  }, [markers, latitude, longitude]);

  // Compute prediction
  const prediction = useMemo(() => {
    return calculateActivityPrediction(latitude, longitude, weatherData, localCatchesCount);
  }, [latitude, longitude, weatherData, localCatchesCount]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'teal';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  const getScoreDescription = (label: string) => {
    switch (label) {
      case 'Excellent':
        return 'Ideal conditions for feeding! Get your lines wet immediately. 🎣';
      case 'Good':
        return 'Favorable conditions. High likelihood of landing solid catches.';
      case 'Moderate':
        return 'Average activity. Fish may be selective. Target structure and drop-offs.';
      default:
        return 'Slow activity. Target deep holes and wait for solar-lunar peaks.';
    }
  };

  return (
    <Card shadow="sm" padding="md" radius="lg" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon variant="light" color="teal" size="md" radius="md">
              <IconChartLine size={18} />
            </ThemeIcon>
            <Text fw={600} size="sm">Smart Fish Prediction</Text>
          </Group>
          <Badge color={getScoreColor(prediction.overallScore)} variant="filled" size="sm">
            {prediction.overallLabel} ({prediction.overallScore}%)
          </Badge>
        </Group>

        <Box py={2}>
          <Text size="xs" c="dimmed" fw={500}>
            {getScoreDescription(prediction.overallLabel)}
          </Text>
        </Box>

        {/* Global Progress bar */}
        <Progress 
          value={prediction.overallScore} 
          color={getScoreColor(prediction.overallScore)} 
          size="md" 
          radius="xl" 
          animated 
        />

        <Stack gap={6} mt="xs" bg="var(--mantine-color-gray-0)" p="sm" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
          <Group gap="xs" wrap="nowrap">
            <IconActivity size={14} style={{ color: 'var(--mantine-color-indigo-6)', flexShrink: 0 }} />
            <Text size="xs" fw={500}>{prediction.astronomicalInfluence}</Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <IconInfoCircle size={14} style={{ color: 'var(--mantine-color-teal-6)', flexShrink: 0 }} />
            <Text size="xs" fw={500}>{prediction.weatherInfluence}</Text>
          </Group>
        </Stack>

        <Text fw={700} size="xs" mt="sm">Species Activity Breakdown</Text>
        
        <Accordion variant="separated" radius="md">
          {prediction.speciesBreakdown.map((s) => (
            <Accordion.Item key={s.species} value={s.species} style={{ border: 'none', background: 'transparent' }}>
              <Accordion.Control style={{ padding: '6px 8px' }}>
                <Group justify="space-between" wrap="nowrap">
                  <Text size="xs" fw={600}>{s.species}</Text>
                  <Group gap="xs">
                    <Badge color={getScoreColor(s.score)} variant="light" size="xs">
                      {s.label} ({s.score}%)
                    </Badge>
                  </Group>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap={6} pt={2}>
                  <Progress value={s.score} color={getScoreColor(s.score)} size="xs" radius="xl" />
                  <Text size="11px" c="dimmed">{s.reason}</Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Stack>
    </Card>
  );
}
