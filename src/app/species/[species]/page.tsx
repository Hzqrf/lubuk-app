import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Container, Card, Text, Title, Group, Badge, Stack, Grid, SimpleGrid, Button } from '@mantine/core';
import { IconMapPin, IconCalendar, IconFish, IconChevronLeft } from '@tabler/icons-react';
import { format } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{
    species: string;
  }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSpecies = decodeURIComponent(resolvedParams.species);
  const speciesName = decodedSpecies.charAt(0).toUpperCase() + decodedSpecies.slice(1);

  return {
    title: `Best Fishing Spots for ${speciesName} | Lubuk`,
    description: `Discover where to catch ${speciesName}, active maps, real angler catch photos, optimal baits, and real-time weather predictions on Lubuk.`,
    openGraph: {
      title: `Best Fishing Spots for ${speciesName} | Lubuk`,
      description: `Explore the live community map tracking catches of ${speciesName}. View photos, bait notes, and weather predictions.`,
      type: 'website',
    },
  };
}

// Local mock profiles database matching week4 catches joins
interface CatchRecord {
  id: string;
  fish_species: string;
  note: string;
  image_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
  user_id: string;
}

export default async function SpeciesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const decodedSpecies = decodeURIComponent(resolvedParams.species);
  
  // Fetch species details case-insensitively from db
  let dbSpecies: any = null;
  try {
    const { data } = await supabase
      .from('species_dictionary')
      .select('*')
      .ilike('name', decodedSpecies)
      .maybeSingle();
    dbSpecies = data;
  } catch (err) {
    console.error('Failed to fetch species details from DB:', err);
  }

  // Normalize string for DB lookup (matching database name case)
  const speciesKey = dbSpecies?.name || (decodedSpecies.charAt(0).toUpperCase() + decodedSpecies.slice(1));
  const emoji = dbSpecies?.emoji || '🐟';

  // 1. Fetch recent catches of this species
  const { data: catches, error } = await supabase
    .from('catches')
    .select('*')
    .eq('fish_species', speciesKey)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to load SEO catches:', error);
  }

  // 2. Fetch profiles for display names
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

  // Get description and guidelines
  const getSpeciesDescription = (name: string) => {
    switch (name) {
      case 'Haruan':
        return {
          scientific: 'Channa striata (Common Snakehead)',
          bio: 'A highly resilient freshwater air-breathing snakehead fish native to South and Southeast Asia. Renowned for its firm, sweet medicinal flesh and aggressive ambush strikes.',
          bait: 'Frogs (jump frogs, soft frogs), spoons, soft plastics, and live earthworms.',
          time: 'Early morning (6:30 AM - 8:30 AM) and late evening (5:30 PM - 7:00 PM).',
          habitat: 'Heavy weed covers, shallow swamp channels, and lotus beds.',
        };
      case 'Toman':
        return {
          scientific: 'Channa micropeltes (Giant Snakehead)',
          bio: 'The largest of the snakehead family, Tomans are apex predators capable of apex aggressive hits. Known to tear up lures and put up high-intensity structural fights.',
          bait: 'Surface buzzbaits, pencils, deep crankbaits, and live tilapia.',
          time: 'Sunny mid-day hours when they breach to breathe air, and early morning.',
          habitat: 'Deep reservoirs, fallen logs, submerged timber, and deep banks.',
        };
      case 'Peacock Bass':
        return {
          scientific: 'Cichla ocellaris',
          bio: 'An introduced species native to the Amazon basin. Sight predators characterized by vibrant yellow-green patterns and high visual acuity. Feeds heavily in clear waters.',
          bait: 'Minnow lures, fly fishing streamers, poppers, and small spinners.',
          time: 'Bright sunny daytime (9:00 AM - 3:00 PM). Glare enhances their visual hunting.',
          habitat: 'Clear mining lakes, rocky drop-offs, and bridge pillars.',
        };
      case 'Patin':
        return {
          scientific: 'Pangasianodon hypophthalmus (Striped Catfish)',
          bio: 'A large, powerful river catfish that lives in deep channels. A popular sportfish in reservoirs, famous for heavy bottom fights that test anglers\' lines.',
          bait: 'Bread dough, chicken skins, fermented paste, and commercial pellets.',
          time: 'Late dusk, night, and early dawn.',
          habitat: 'Deep riverbed troughs, lake centers, and structural drop-offs.',
        };
      default:
        return {
          scientific: 'Oreochromis niloticus',
          bio: 'A popular freshwater cichlid fish highly adaptive and found in abundance. Tilapias are perfect target species for fast, light-tackle action.',
          bait: 'Small earthworms, bread crumbs, small soft grubs, and algae pastes.',
          time: 'Daytime, active in warm shallow zones.',
          habitat: 'Shallow grassy banks, vegetated shoreline structures, and pond edges.',
        };
    }
  };

  const localBio = getSpeciesDescription(speciesKey);
  const bio = {
    scientific: dbSpecies?.scientific_name || localBio.scientific,
    bio: dbSpecies?.description || localBio.bio,
    habitat: dbSpecies?.habitat || localBio.habitat,
    bait: localBio.bait,
    time: localBio.time,
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
        {/* Banner Card */}
        <Card shadow="sm" radius="lg" p="xl" bg="var(--mantine-color-blue-0)" style={{ backgroundOpacity: 0.05 }} withBorder>
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Group gap="xs">
                <Title order={1} style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                  {emoji} {speciesKey} Catch Reports
                </Title>
              </Group>
              <Text size="sm" style={{ fontStyle: 'italic' }} c="blue" fw={600}>
                {bio.scientific}
              </Text>
              <Text size="sm" mt="sm" style={{ maxWidth: 700, lineHeight: 1.6 }}>
                {bio.bio}
              </Text>
            </Stack>
            <Badge size="lg" color="blue" variant="filled">
              Species Index
            </Badge>
          </Group>
        </Card>

        {/* Detailed Guidelines Grid */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="xs" radius="md" p="md" withBorder h="100%">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconFish size={18} style={{ color: 'var(--mantine-color-indigo-6)' }} />
                  <Text fw={700} size="sm">Recommended Baits</Text>
                </Group>
                <Text size="xs" style={{ lineHeight: 1.5 }}>{bio.bait}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="xs" radius="md" p="md" withBorder h="100%">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconFish size={18} style={{ color: 'var(--mantine-color-teal-6)' }} />
                  <Text fw={700} size="sm">Best Feeding Windows</Text>
                </Group>
                <Text size="xs" style={{ lineHeight: 1.5 }}>{bio.time}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="xs" radius="md" p="md" withBorder h="100%">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconMapPin size={18} style={{ color: 'var(--mantine-color-green-6)' }} />
                  <Text fw={700} size="sm">Optimal Habitat Structure</Text>
                </Group>
                <Text size="xs" style={{ lineHeight: 1.5 }}>{bio.habitat}</Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Recent Catches Listing */}
        <Stack gap="sm" mt="md">
          <Title order={2} size="h3" fw={800}>
            Recent {speciesKey} Catches Logged by Anglers
          </Title>

          {!catches || catches.length === 0 ? (
            <Card padding="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
              <Text size="md" fw={600}>No catches logged for {speciesKey} yet</Text>
              <Text size="xs" c="dimmed" mt={4}>Be the first to log a catch on our live map!</Text>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="light" size="sm" mt="md">
                  Go to Live Map
                </Button>
              </Link>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {catches.map((item: CatchRecord) => (
                <Card key={item.id} shadow="xs" radius="md" padding="md" withBorder style={{ display: 'flex', flexDirection: 'column' }}>
                  {item.image_url && (
                    <Card.Section>
                      <img 
                        src={item.image_url} 
                        alt={`${speciesKey} catch by ${profilesMap[item.user_id]}`} 
                        style={{ width: '100%', height: 200, objectFit: 'cover' }}
                      />
                    </Card.Section>
                  )}
                  <Stack gap="xs" mt="sm" style={{ flexGrow: 1 }}>
                    <Text size="xs" c="dimmed">
                      Reported by <Text component="span" fw={700}>{profilesMap[item.user_id] || 'Angler'}</Text>
                    </Text>
                    <Text size="sm" fw={600} style={{ flexGrow: 1 }}>
                      {item.note || 'No catch notes recorded.'}
                    </Text>
                    
                    <Group justify="space-between" mt="md">
                      <Badge size="xs" color="gray" variant="light" leftSection={<IconMapPin size={10} />}>
                        {item.latitude.toFixed(4)}°, {item.longitude.toFixed(4)}°
                      </Badge>
                      <Badge size="xs" color="blue" variant="light" leftSection={<IconCalendar size={10} />}>
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
