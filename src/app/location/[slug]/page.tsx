import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Container, Card, Text, Title, Group, Badge, Stack, Grid, SimpleGrid, Button, Box } from '@mantine/core';
import { IconMapPin, IconCalendar, IconChevronLeft, IconSun } from '@tabler/icons-react';
import { format } from 'date-fns';
import { getMoonPhase } from '@/features/weather/MoonPhaseWidget';
import { calculateActivityPrediction } from '@/features/prediction/predictionService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Database of standard famous fishing spots in Malaysia
const PREDEFINED_LOCATIONS: Record<string, { name: string; lat: number; lon: number; desc: string }> = {
  'tasik-perak': {
    name: 'Tasik Perak (Perak Lake)',
    lat: 4.6000,
    lon: 101.0000,
    desc: 'Famous freshwater basin heavily populated with premium Haruan (Snakehead) and wild Tilapia. Features expansive shallow weed cover.',
  },
  'tasik-kenyir': {
    name: 'Tasik Kenyir (Kenyir Lake)',
    lat: 5.0000,
    lon: 102.8000,
    desc: 'The largest man-made lake in Southeast Asia. An extreme angling paradise populated with giant Toman, Kelah, and Sebarau.',
  },
  'sungai-selangor': {
    name: 'Sungai Selangor (Selangor River)',
    lat: 3.4000,
    lon: 101.3000,
    desc: 'A pristine flowing estuary home to giant river prawns (Udang Galah) and active Patin catfish.',
  },
  'port-dickson': {
    name: 'Port Dickson Coastal Reefs',
    lat: 2.5229,
    lon: 101.7946,
    desc: 'Coastal rock structures ideal for salt-water sight casting and light jigging.',
  },
  'klang-gates': {
    name: 'Klang Gates Dam',
    lat: 3.2300,
    lon: 101.7500,
    desc: 'Highly aesthetic quartz ridge reservoir featuring clean mountain runoffs and elusive Peacock Bass schools.',
  }
};

function getLocationData(slug: string) {
  const normalized = slug.toLowerCase();
  return PREDEFINED_LOCATIONS[normalized] || {
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    lat: 3.1390,
    lon: 101.6869,
    desc: 'An active fishing spot mapped by the Lubuk community. Explore live catch reports, weather telemetry, and optimal bite forecasts below.',
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const loc = getLocationData(resolvedParams.slug);

  return {
    title: `Best Fishing Spots in ${loc.name} | Lubuk`,
    description: `${loc.desc} Get real-time weather forecasts, moon phase indexes, and view real angler catches at ${loc.name}.`,
    openGraph: {
      title: `Best Fishing Spots in ${loc.name} | Lubuk`,
      description: `View active fishing spots, catches, and real-time fish activity telemetry at ${loc.name} on the Lubuk map.`,
      type: 'website',
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const resolvedParams = await params;
  const loc = getLocationData(resolvedParams.slug);

  // 1. Fetch current weather from Open-Meteo Server-Side!
  let weatherData = null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset,uv_index_max&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache forecast for 1 hour on server
    if (res.ok) {
      weatherData = await res.json();
    }
  } catch (e) {
    console.error('Failed to load server-side weather for location:', e);
  }

  // 2. Fetch catches within an approximate bounding box (~10km) of this location
  const boundingDelta = 0.1; // ~11km
  const { data: catches } = await supabase
    .from('catches')
    .select('*')
    .gte('latitude', loc.lat - boundingDelta)
    .lte('latitude', loc.lat + boundingDelta)
    .gte('longitude', loc.lon - boundingDelta)
    .lte('longitude', loc.lon + boundingDelta)
    .order('created_at', { ascending: false })
    .limit(10);

  // Map profile names
  const userIds = catches ? [...new Set(catches.map((c: any) => c.user_id))] : [];
  let profilesMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);
    profiles?.forEach((p: any) => {
      profilesMap[p.id] = p.display_name;
    });
  }

  // 3. Compute static astronomical info & prediction
  const moon = getMoonPhase(new Date());
  const prediction = calculateActivityPrediction(
    loc.lat,
    loc.lon,
    weatherData ? { current: weatherData.current, daily: weatherData.daily } as any : null,
    catches?.length || 0
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'teal';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  return (
    <Container size="md" py="xl">
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Button 
          variant="subtle" 
          color="gray" 
          size="xs" 
          leftSection={<IconChevronLeft size={14} />}
          mb="lg"
        >
          Back to Live Map
        </Button>
      </Link>

      <Stack gap="xl">
        {/* Spot Intro Card */}
        <Card shadow="sm" radius="lg" p="xl" withBorder>
          <Group justify="space-between">
            <Stack gap={2}>
              <Badge color="indigo" variant="filled">FISHING DESTINATION</Badge>
              <Title order={1} mt={4} style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                {loc.name}
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Coordinates: {loc.lat.toFixed(4)}° N, {loc.lon.toFixed(4)}° E
              </Text>
            </Stack>
            <Badge color={getScoreColor(prediction.overallScore)} size="xl" variant="light">
              Bite Rate: {prediction.overallLabel} ({prediction.overallScore}%)
            </Badge>
          </Group>
          <Text size="sm" mt="md" style={{ lineHeight: 1.6, maxWidth: 800 }}>
            {loc.desc}
          </Text>
        </Card>

        {/* Dynamic weather/astro metrics columns */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="xs" radius="md" p="md" withBorder h="100%">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconSun size={20} style={{ color: 'var(--mantine-color-blue-5)' }} />
                  <Text fw={700} size="sm">Current Spot Weather</Text>
                </Group>
                
                {weatherData ? (
                  <SimpleGrid cols={2} mt="xs">
                    <Box>
                      <Text size="10px" c="dimmed">TEMPERATURE</Text>
                      <Text size="md" fw={800}>{Math.round(weatherData.current.temperature_2m)}°C</Text>
                    </Box>
                    <Box>
                      <Text size="10px" c="dimmed">PRESSURE</Text>
                      <Text size="md" fw={800}>{Math.round(weatherData.current.pressure_msl)} hPa</Text>
                    </Box>
                    <Box mt="xs">
                      <Text size="10px" c="dimmed">WIND</Text>
                      <Text size="md" fw={800}>{Math.round(weatherData.current.wind_speed_10m)} km/h</Text>
                    </Box>
                    <Box mt="xs">
                      <Text size="10px" c="dimmed">HUMIDITY</Text>
                      <Text size="md" fw={800}>{weatherData.current.relative_humidity_2m}%</Text>
                    </Box>
                  </SimpleGrid>
                ) : (
                  <Text size="xs" c="dimmed">Unable to pull weather telemetry at this moment.</Text>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="xs" radius="md" p="md" withBorder h="100%">
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="md">🌑</Text>
                  <Text fw={700} size="sm">Astro & Lunar Factors</Text>
                </Group>
                
                <SimpleGrid cols={2} mt="xs">
                  <Box>
                    <Text size="10px" c="dimmed">MOON PHASE</Text>
                    <Text size="sm" fw={700}>{moon.name} {moon.emoji}</Text>
                  </Box>
                  <Box>
                    <Text size="10px" c="dimmed">ILLUMINATION</Text>
                    <Text size="sm" fw={700}>{moon.illumination}%</Text>
                  </Box>
                  <Box mt="xs">
                    <Text size="10px" c="dimmed">ASTRONOMICAL INFLUENCE</Text>
                    <Text size="xs" style={{ lineHeight: 1.3 }}>{prediction.astronomicalInfluence}</Text>
                  </Box>
                  <Box mt="xs">
                    <Text size="10px" c="dimmed">WEATHER INFLUENCE</Text>
                    <Text size="xs" style={{ lineHeight: 1.3 }}>{prediction.weatherInfluence}</Text>
                  </Box>
                </SimpleGrid>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Localized Catch Listing */}
        <Stack gap="sm" mt="md">
          <Title order={2} size="h3" fw={800}>
            Local Catch Activity Registered Near {loc.name}
          </Title>

          {!catches || catches.length === 0 ? (
            <Card padding="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
              <Text size="md" fw={600}>No recent catches logged near this hotspot</Text>
              <Text size="xs" c="dimmed" mt={4}>Explore other areas or log a catch on our live map!</Text>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="light" size="sm" mt="md">
                  View Live Map
                </Button>
              </Link>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {catches.map((item) => (
                <Card key={item.id} shadow="xs" radius="md" padding="md" withBorder>
                  {item.image_url && (
                    <Card.Section>
                      <img 
                        src={item.image_url} 
                        alt={`${item.fish_species} caught at ${loc.name}`} 
                        style={{ width: '100%', height: 180, objectFit: 'cover' }}
                      />
                    </Card.Section>
                  )}
                  <Stack gap="xs" mt="sm">
                    <Group justify="space-between">
                      <Badge size="xs" color="blue" variant="filled">{item.fish_species}</Badge>
                      <Text size="xs" c="dimmed">
                        By <Text component="span" fw={700}>{profilesMap[item.user_id] || 'Angler'}</Text>
                      </Text>
                    </Group>
                    <Text size="xs" fw={500}>{item.note || 'No notes left.'}</Text>
                    <Group justify="space-between" mt="xs">
                      <Badge size="9px" color="gray" variant="light" leftSection={<IconMapPin size={8} />}>
                        {item.latitude.toFixed(3)}°, {item.longitude.toFixed(3)}°
                      </Badge>
                      <Badge size="9px" color="blue" variant="light" leftSection={<IconCalendar size={8} />}>
                        {format(new Date(item.created_at), 'MMM dd, yyyy hh:mm a')}
                      </Badge>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
