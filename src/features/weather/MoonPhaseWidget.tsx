'use client';

import { Card, Text, Group, Stack, Grid, Box, ThemeIcon, SimpleGrid } from '@mantine/core';
import { IconMoon, IconSunrise, IconSunset } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';

interface MoonPhaseWidgetProps {
  date?: Date;
  sunrise?: string;
  sunset?: string;
}

export function getMoonPhase(date: Date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  let c = 0, e = 0, jd = 0;

  let yTemp = year;
  let mTemp = month;

  if (mTemp < 3) {
    yTemp--;
    mTemp += 12;
  }

  // Julian Day calculation
  const A = Math.floor(yTemp / 100);
  const B = Math.floor(A / 4);
  c = 2 - A + B;
  e = Math.floor(365.25 * (yTemp + 4716));
  const f = Math.floor(30.6001 * (mTemp + 1));
  jd = c + day + e + f - 1524.5;

  // Days since last new moon (approximate epoch 2000-01-06 new moon)
  const daysSinceNew = jd - 2451549.5; 
  const newMoons = daysSinceNew / 29.530588853;
  const cyclePercentage = newMoons - Math.floor(newMoons);
  const phaseValue = cyclePercentage >= 0 ? cyclePercentage : cyclePercentage + 1;

  // Determine illumination percentage
  let illumination = 0;
  if (phaseValue <= 0.5) {
    illumination = phaseValue * 2;
  } else {
    illumination = (1 - phaseValue) * 2;
  }

  // Determine name and emoji
  let name = '';
  let emoji = '';
  
  if (phaseValue < 0.03 || phaseValue >= 0.97) {
    name = 'New Moon';
    emoji = '🌑';
  } else if (phaseValue < 0.22) {
    name = 'Waxing Crescent';
    emoji = '🌒';
  } else if (phaseValue < 0.28) {
    name = 'First Quarter';
    emoji = '🌓';
  } else if (phaseValue < 0.47) {
    name = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (phaseValue < 0.53) {
    name = 'Full Moon';
    emoji = '🌕';
  } else if (phaseValue < 0.72) {
    name = 'Waning Gibbous';
    emoji = '🌖';
  } else if (phaseValue < 0.78) {
    name = 'Last Quarter';
    emoji = '🌗';
  } else {
    name = 'Waning Crescent';
    emoji = '🌘';
  }

  return {
    value: phaseValue,
    name,
    emoji,
    illumination: Math.round(illumination * 100),
  };
}

export function MoonPhaseWidget({ date = new Date(), sunrise, sunset }: MoonPhaseWidgetProps) {
  const moon = getMoonPhase(date);

  const formatTimeString = (isoStr?: string) => {
    if (!isoStr) return '--:--';
    try {
      return format(parseISO(isoStr), 'hh:mm a');
    } catch {
      return '--:--';
    }
  };

  return (
    <Card shadow="sm" padding="md" radius="lg" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon variant="light" color="indigo" size="md" radius="md">
              <IconMoon size={18} />
            </ThemeIcon>
            <Text fw={600} size="sm">Astronomical Info</Text>
          </Group>
          <Text size="xs" fw={700} c="indigo">{moon.name}</Text>
        </Group>

        <Grid align="center" py="xs">
          <Grid.Col span={5}>
            <Box style={{ position: 'relative', width: 60, height: 60, margin: '0 auto' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e1e38 0%, #0d0d1a 100%)',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 0 0 15px rgba(99,102,241,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Illumination overlay using CSS gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: moon.value <= 0.5 ? 0 : 'auto',
                  right: moon.value > 0.5 ? 0 : 'auto',
                  width: `${moon.illumination}%`,
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)',
                  boxShadow: '0 0 8px rgba(255,255,255,0.7)',
                  opacity: 0.85
                }} />
              </div>
              <Text size="xl" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 }}>
                {moon.emoji}
              </Text>
            </Box>
          </Grid.Col>
          <Grid.Col span={7}>
            <Stack gap={2}>
              <Text fw={800} size="md" lh={1.2}>
                {moon.illumination}% Illuminated
              </Text>
              <Text size="xs" c="dimmed">
                Phase Index: {moon.value.toFixed(4)}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider my={4} color="var(--mantine-color-gray-2)" />

        <SimpleGrid cols={2}>
          <Group gap="xs">
            <ThemeIcon variant="subtle" color="orange" size="sm">
              <IconSunrise size={16} />
            </ThemeIcon>
            <Box>
              <Text size="9px" c="dimmed" fw={600} style={{ textTransform: 'uppercase' }}>Sunrise</Text>
              <Text size="xs" fw={700}>{formatTimeString(sunrise)}</Text>
            </Box>
          </Group>
          <Group gap="xs">
            <ThemeIcon variant="subtle" color="violet" size="sm">
              <IconSunset size={16} />
            </ThemeIcon>
            <Box>
              <Text size="9px" c="dimmed" fw={600} style={{ textTransform: 'uppercase' }}>Sunset</Text>
              <Text size="xs" fw={700}>{formatTimeString(sunset)}</Text>
            </Box>
          </Group>
        </SimpleGrid>
      </Stack>
    </Card>
  );
}

// Quick tiny helper for simple divider line
function Divider({ my, color }: { my: number; color: string }) {
  return <div style={{ marginTop: my, marginBottom: my, borderBottom: `1px solid ${color}` }} />;
}
