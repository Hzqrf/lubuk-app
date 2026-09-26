import { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, Text, Title, Group, Badge, Stack, SimpleGrid, Button } from '@mantine/core';
import { IconMap2, IconTarget, IconChevronLeft, IconFlame } from '@tabler/icons-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FALLBACK_SPECIES = [
  { name: 'Haruan', emoji: '🐟' },
  { name: 'Toman', emoji: '🐡' },
  { name: 'Patin', emoji: '🐋' },
  { name: 'Peacock Bass', emoji: '🐠' },
  { name: 'Tilapia', emoji: '🎣' },
  { name: 'Sebarau', emoji: '🎏' },
  { name: 'Kelah', emoji: '👑' }
];

export const metadata: Metadata = {
  title: 'Trending Fishing Spots & Map Hotspots | Lubuk',
  description: 'Explore live, trending fishing maps clustered by actual catches. Dive into locations like Tasik Kenyir, Tasik Perak, and analyze real angler catch counts.',
};

const POPULAR_SPOTS = [
  {
    slug: 'tasik-perak',
    name: 'Tasik Perak (Perak Lake)',
    species: 'Haruan, Tilapia',
    lat: 4.6000,
    lon: 101.0000,
    desc: 'Top active spot for ambush fishing under dense vegetative weed layers.',
  },
  {
    slug: 'tasik-kenyir',
    name: 'Tasik Kenyir (Kenyir Lake)',
    species: 'Toman, Patin',
    lat: 5.0000,
    lon: 102.8000,
    desc: 'Deep water reservoir ideal for giant sportfish and apex surface action.',
  },
  {
    slug: 'sungai-selangor',
    name: 'Sungai Selangor (Selangor River)',
    species: 'Patin, Mixed',
    lat: 3.4000,
    lon: 101.3000,
    desc: 'Active river channels loaded with bottom nutrients and organic crustacean streams.',
  },
  {
    slug: 'klang-gates',
    name: 'Klang Gates Dam',
    species: 'Peacock Bass',
    lat: 3.2300,
    lon: 101.7500,
    desc: 'High clarity quartz-reservoir optimized for sight-predator casting.',
  }
];

export default async function TrendingIndexPage() {
  let speciesList = FALLBACK_SPECIES;
  try {
    const { data, error } = await supabase
      .from('species_dictionary')
      .select('name, emoji')
      .order('name');
    if (!error && data && data.length > 0) {
      speciesList = data;
    }
  } catch (err) {
    console.error('Failed to load species in trending page:', err);
  }

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
        <Card shadow="sm" radius="lg" p="xl" bg="var(--mantine-color-orange-0)" style={{ backgroundOpacity: 0.05 }} withBorder>
          <Group justify="space-between">
            <Stack gap={2}>
              <Badge color="orange" variant="filled" leftSection={<IconFlame size={12} />}>TRENDING DISCOVERY</Badge>
              <Title order={1} mt={4} style={{ fontSize: '2.3rem', fontWeight: 800 }}>
                Trending Hot Spots & Species
              </Title>
              <Text size="sm" c="dimmed" mt={4} style={{ maxWidth: 650 }}>
                Analyze localized coordinates, track feeding behavior, and jump straight into targeted species profiles.
              </Text>
            </Stack>
          </Group>
        </Card>

        {/* Hotspots catalog */}
        <Stack gap="sm">
          <Title order={2} size="h3" fw={800}>Trending Locations</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {POPULAR_SPOTS.map((spot) => (
              <Card key={spot.slug} shadow="xs" radius="md" padding="md" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={700} size="sm">{spot.name}</Text>
                    <Badge color="orange" size="xs">🔥 HOTSPOT</Badge>
                  </Group>
                  <Text size="xs" c="dimmed">{spot.desc}</Text>
                  <Group justify="space-between" mt="sm">
                    <Badge color="blue" variant="light" size="xs" leftSection={<IconMap2 size={10} />}>
                      {spot.species}
                    </Badge>
                    <Link href={`/location/${spot.slug}`} style={{ textDecoration: 'none' }}>
                      <Button 
                        variant="light" 
                        color="blue" 
                        size="xs"
                        leftSection={<IconTarget size={12} />}
                      >
                        View Reports
                      </Button>
                    </Link>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>

        {/* Species catalog */}
        <Stack gap="sm" mt="md">
          <Title order={2} size="h3" fw={800}>Species-Specific Maps</Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            {speciesList.map((s) => (
              <Card key={s.name} shadow="xs" radius="md" padding="sm" withBorder style={{ textAlign: 'center' }}>
                <Text size="2.5rem">{s.emoji || '🐟'}</Text>
                <Text fw={700} size="sm" mt="xs">{s.name}</Text>
                <Link href={`/species/${s.name.toLowerCase()}`} style={{ textDecoration: 'none', width: '100%' }}>
                  <Button 
                    variant="subtle" 
                    color="blue" 
                    size="xs" 
                    mt="sm"
                    fullWidth
                  >
                    Explore Species
                  </Button>
                </Link>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </Container>
  );
}
