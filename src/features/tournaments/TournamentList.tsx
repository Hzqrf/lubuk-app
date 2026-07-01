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
  Button,
  Image,
  Progress
} from '@mantine/core';
import { IconTrophy, IconClock, IconUsers } from '@tabler/icons-react';

const mockTournaments = [
  {
    id: '1',
    title: 'Biggest Haruan November 2023',
    description: 'Catch the heaviest Channa Striata this month to win exclusive gear!',
    cover_image: 'https://images.unsplash.com/photo-1559286825-9ba6368d4f45?auto=format&fit=crop&q=80&w=600',
    participants: 142,
    daysLeft: 12,
    status: 'active',
    prize: 'RM 500 Tackle Voucher'
  },
  {
    id: '2',
    title: 'Weekend Warrior Challenge',
    description: 'Log the most hours fishing this weekend.',
    cover_image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&q=80&w=600',
    participants: 350,
    daysLeft: 2,
    status: 'active',
    prize: 'Premium Lure Set'
  },
  {
    id: '3',
    title: 'Kelah Expedition 2023',
    description: 'First to catch and release a Kelah over 3kg.',
    cover_image: 'https://images.unsplash.com/photo-1518342407559-4b679aabf08e?auto=format&fit=crop&q=80&w=600',
    participants: 45,
    daysLeft: 0,
    status: 'completed',
    prize: 'Shimano Stella 4000'
  }
];

export function TournamentList() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2} c="blue.6">Tournaments & Challenges</Title>
            <Text c="dimmed" size="sm">Compete with anglers and win prizes</Text>
          </div>
        </Group>

        <Grid>
          {mockTournaments.map((tournament) => (
            <Grid.Col span={{ base: 12, md: 6 }} key={tournament.id}>
              <Card withBorder radius="md" p={0} className={`transition-all hover:shadow-md cursor-pointer flex flex-col h-full ${tournament.status === 'completed' ? 'opacity-80' : ''}`}>
                <div className="relative h-40 w-full bg-gray-100">
                  <Image 
                    src={tournament.cover_image} 
                    alt={tournament.title} 
                    h="100%" 
                    fit="cover" 
                  />
                  <div className="absolute top-2 left-2">
                    {tournament.status === 'active' ? (
                       <Badge color="blue" variant="filled">Active</Badge>
                    ) : (
                       <Badge color="gray" variant="filled">Completed</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2">
                     <Badge color="yellow" variant="filled" leftSection={<IconTrophy size={12} />}>
                       Prize: {tournament.prize}
                     </Badge>
                  </div>
                </div>
                
                <Stack p="md" gap="sm" style={{ flexGrow: 1 }}>
                  <Title order={4}>{tournament.title}</Title>
                  <Text size="sm" c="dimmed" lineClamp={2} style={{ flexGrow: 1 }}>
                    {tournament.description}
                  </Text>
                  
                  <Group justify="space-between" mt="md">
                    <Group gap="xs">
                      <IconUsers size={16} className="text-gray-500" />
                      <Text size="sm" fw={500}>{tournament.participants} Joined</Text>
                    </Group>
                    
                    {tournament.status === 'active' && (
                      <Group gap="xs" c="red.6">
                        <IconClock size={16} />
                        <Text size="sm" fw={600}>{tournament.daysLeft} days left</Text>
                      </Group>
                    )}
                  </Group>

                  {tournament.status === 'active' ? (
                     <Button fullWidth mt="xs" radius="md" color="blue">Join Tournament</Button>
                  ) : (
                     <Button fullWidth mt="xs" radius="md" variant="light" color="gray">View Results</Button>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
