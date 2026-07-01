'use client';

import React from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  Text, 
  Group, 
  RingProgress, 
  ThemeIcon, 
  Badge, 
  Stack, 
  Title,
  Paper,
  ActionIcon
} from '@mantine/core';
import { 
  IconFishHook, 
  IconMapPin, 
  IconTrophy, 
  IconCalendarEvent, 
  IconTrendingUp,
  IconShare,
  IconChevronRight
} from '@tabler/icons-react';

// Mock data (would come from React Query based on UserStats)
const mockJournalStats = {
  totalCatches: 142,
  speciesDiscovered: 12,
  totalSpeciesAvailable: 45,
  biggestCatch: { weight: 5.2, species: 'Toman' },
  favoriteLocation: 'Tasik Kenyir',
  catchesThisMonth: 8,
  catchesThisYear: 45,
};

export function JournalDashboard() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header section */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2} c="blue.6">My Fishing Journal</Title>
            <Text c="dimmed" size="sm">Your personal fishing history and statistics</Text>
          </div>
          <ActionIcon variant="light" color="blue" size="lg" radius="md">
            <IconShare size={20} />
          </ActionIcon>
        </Group>

        {/* Main Stats Grid */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder radius="md" p="md" className="transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer">
              <Group>
                <RingProgress
                  size={80}
                  roundCaps
                  thickness={8}
                  sections={[{ value: (mockJournalStats.catchesThisMonth / 10) * 100, color: 'blue' }]}
                  label={
                    <ThemeIcon color="blue" variant="light" radius="xl" size="xl" mx="auto">
                      <IconFishHook size={22} />
                    </ThemeIcon>
                  }
                />
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Catches
                  </Text>
                  <Text fw={700} size="xl">
                    {mockJournalStats.totalCatches}
                  </Text>
                  <Text size="xs" c="green.6" fw={500}>
                    +{mockJournalStats.catchesThisMonth} this month
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder radius="md" p="md" className="transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer">
              <Group>
                <RingProgress
                  size={80}
                  roundCaps
                  thickness={8}
                  sections={[{ value: (mockJournalStats.speciesDiscovered / mockJournalStats.totalSpeciesAvailable) * 100, color: 'teal' }]}
                  label={
                    <ThemeIcon color="teal" variant="light" radius="xl" size="xl" mx="auto">
                      <IconTrophy size={22} />
                    </ThemeIcon>
                  }
                />
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Species (FishDex)
                  </Text>
                  <Text fw={700} size="xl">
                    {mockJournalStats.speciesDiscovered} <Text component="span" size="sm" c="dimmed" fw={400}>/ {mockJournalStats.totalSpeciesAvailable}</Text>
                  </Text>
                  <Group gap={4} mt={2}>
                    <Badge size="xs" color="teal">Top 20%</Badge>
                  </Group>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
            <Paper withBorder radius="md" p="md" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <Stack gap="xs">
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Personal Best</Text>
                <Group justify="space-between">
                  <Title order={3}>{mockJournalStats.biggestCatch.weight} kg</Title>
                  <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                    <IconTrophy size={24} />
                  </ThemeIcon>
                </Group>
                <Text size="sm" fw={500}>{mockJournalStats.biggestCatch.species}</Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Highlights Section */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between" mb="md">
                <Text fw={600}>Favorite Location</Text>
                <ThemeIcon color="red" variant="light" radius="xl">
                  <IconMapPin size={16} />
                </ThemeIcon>
              </Group>
              <Title order={4} mb="xs">{mockJournalStats.favoriteLocation}</Title>
              <Group gap="xs">
                <Badge variant="dot" color="blue">32 Catches here</Badge>
                <Badge variant="dot" color="green">Active Season</Badge>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
             <Card withBorder radius="md" p="md">
              <Group justify="space-between" mb="md">
                <Text fw={600}>Recent Activity</Text>
                <ThemeIcon color="indigo" variant="light" radius="xl">
                  <IconCalendarEvent size={16} />
                </ThemeIcon>
              </Group>
              
              <Stack gap="sm">
                <Group justify="space-between" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-6 p-2 rounded-md transition-colors">
                  <Group gap="sm">
                    <ThemeIcon color="blue" variant="light" radius="xl" size="md">
                      <IconFishHook size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Caught a Haruan</Text>
                      <Text size="xs" c="dimmed">Tasik Kenyir • 2 days ago</Text>
                    </div>
                  </Group>
                  <IconChevronRight size={16} className="text-gray-400" />
                </Group>

                <Group justify="space-between" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-6 p-2 rounded-md transition-colors">
                  <Group gap="sm">
                    <ThemeIcon color="teal" variant="light" radius="xl" size="md">
                      <IconTrendingUp size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Level Up: Explorer</Text>
                      <Text size="xs" c="dimmed">Visited 5 locations • 1 week ago</Text>
                    </div>
                  </Group>
                  <IconChevronRight size={16} className="text-gray-400" />
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
