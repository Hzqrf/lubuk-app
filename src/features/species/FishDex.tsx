'use client';

import React from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  Text, 
  Group, 
  Badge, 
  Stack, 
  Title,
  Progress,
  Image,
  Input
} from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import Link from 'next/link';

// Mock data
const mockSpeciesDictionary = [
  { id: '1', name: 'Haruan', scientific_name: 'Channa striata', habitat: 'Freshwater', rarity: 'common', image_url: 'https://images.unsplash.com/photo-1524317144983-490333d4e78d?auto=format&fit=crop&q=80&w=400', isCaught: true },
  { id: '2', name: 'Toman', scientific_name: 'Channa micropeltes', habitat: 'Lakes', rarity: 'uncommon', image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400', isCaught: true },
  { id: '3', name: 'Patin', scientific_name: 'Pangasius', habitat: 'Rivers', rarity: 'common', image_url: 'https://images.unsplash.com/photo-1516084687920-0081d43a6d90?auto=format&fit=crop&q=80&w=400', isCaught: false },
  { id: '4', name: 'Sebarau', scientific_name: 'Hampala macrolepidota', habitat: 'Clear rivers', rarity: 'rare', image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400', isCaught: false },
  { id: '5', name: 'Kelah', scientific_name: 'Tor tambroides', habitat: 'Jungle rivers', rarity: 'legendary', image_url: 'https://images.unsplash.com/photo-1518342407559-4b679aabf08e?auto=format&fit=crop&q=80&w=400', isCaught: false },
];

export function FishDex() {
  const caughtCount = mockSpeciesDictionary.filter(s => s.isCaught).length;
  const totalCount = mockSpeciesDictionary.length;
  const progressPercent = (caughtCount / totalCount) * 100;

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'gray';
      case 'uncommon': return 'blue';
      case 'rare': return 'purple';
      case 'legendary': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header section */}
        <div>
          <Title order={2} c="blue.6">FishDex</Title>
          <Text c="dimmed" size="sm">Discover and collect Malaysian fish species</Text>
        </div>

        {/* Progress Card */}
        <Card withBorder radius="md" p="md" className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={600}>Collection Progress</Text>
              <Text fw={700} c="blue.6">{caughtCount} / {totalCount}</Text>
            </Group>
            <Progress value={progressPercent} color="blue" size="xl" radius="xl" striped animated />
            <Text size="xs" c="dimmed" align="right">{progressPercent.toFixed(0)}% Completed</Text>
          </Stack>
        </Card>

        {/* Search & Filter */}
        <Group grow>
          <Input 
            placeholder="Search species..." 
            leftSection={<IconSearch size={16} />} 
            radius="md"
          />
          <Badge variant="light" color="gray" size="xl" radius="md" style={{ cursor: 'pointer', flexGrow: 0, padding: '0 1rem' }}>
            <Group gap="xs">
              <IconFilter size={16} />
              <Text size="sm">Filter</Text>
            </Group>
          </Badge>
        </Group>

        {/* Species Grid - Pokedex Style */}
        <Grid>
          {mockSpeciesDictionary.map((species, index) => {
            const dexNumber = String(index + 1).padStart(3, '0');
            return (
              <Grid.Col span={{ base: 6, sm: 4, md: 3 }} key={species.id}>
                <Card 
                  component={Link}
                  href={`/species/${species.name.toLowerCase()}`}
                  withBorder 
                  radius="lg" 
                  p="sm" 
                  className={`transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer h-full border-2 ${
                    species.isCaught ? 'border-blue-200 dark:border-blue-800 bg-gradient-to-b from-white to-blue-50 dark:from-dark-7 dark:to-dark-8' : 'border-gray-200 dark:border-dark-6 bg-gray-50 dark:bg-dark-7 opacity-80'
                  }`}
                >
                  <Stack align="center" gap={4}>
                    <Group justify="space-between" w="100%">
                      <Text size="xs" fw={700} c="dimmed">#{dexNumber}</Text>
                      {species.isCaught ? (
                        <Badge color="green" variant="filled" size="xs" circle>✓</Badge>
                      ) : (
                        <IconSearch size={14} className="text-gray-400" />
                      )}
                    </Group>

                    <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-2 mb-2 ${species.isCaught ? 'bg-white shadow-inner' : 'bg-gray-200 dark:bg-dark-6'}`}>
                      <Image 
                        src={species.image_url} 
                        alt={species.name} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          filter: species.isCaught ? 'none' : 'contrast(0.2) brightness(1.5) grayscale(1)',
                        }}
                        fallbackSrc="https://placehold.co/400x400?text=?"
                      />
                    </div>
                    
                    <Text fw={800} size="lg" className={species.isCaught ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}>
                      {species.isCaught ? species.name : '???'}
                    </Text>
                    
                    {species.isCaught && (
                      <Badge size="sm" color={getRarityColor(species.rarity)} variant="light" mt={4}>
                        {species.rarity}
                      </Badge>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </Container>
  );
}
