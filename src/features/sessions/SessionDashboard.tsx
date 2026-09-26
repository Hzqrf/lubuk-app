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
  ActionIcon,
  ThemeIcon,
  Paper
} from '@mantine/core';
import { 
  IconPlayerPlay, 
  IconMapPin, 
  IconClock, 
  IconFishHook,
  IconSun,
  IconDotsVertical
} from '@tabler/icons-react';

const mockSessions = [
  {
    id: '1',
    location: 'Tasik Kenyir',
    date: 'Oct 24, 2023',
    duration: '4h 20m',
    catches: 5,
    weather: 'Sunny',
    temp: '32°C'
  },
  {
    id: '2',
    location: 'Sungai Pahang',
    date: 'Oct 15, 2023',
    duration: '2h 45m',
    catches: 2,
    weather: 'Cloudy',
    temp: '28°C'
  },
  {
    id: '3',
    location: 'Kelong Acheh',
    date: 'Oct 02, 2023',
    duration: '6h 10m',
    catches: 12,
    weather: 'Rainy',
    temp: '26°C'
  }
];

export function SessionDashboard() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} c="blue.6">Fishing Sessions</Title>
            <Text c="dimmed" size="sm">Track your time on the water</Text>
          </div>
          <Button 
            size="md" 
            radius="md" 
            color="blue" 
            leftSection={<IconPlayerPlay size={18} />}
            className="shadow-md hover:-translate-y-0.5 transition-transform"
          >
            Start Session
          </Button>
        </Group>

        {/* Stats Overview */}
        <Grid>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Sessions</Text>
              <Text size="xl" fw={700}>42</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Time on Water</Text>
              <Text size="xl" fw={700}>148h</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Avg Duration</Text>
              <Text size="xl" fw={700}>3.5h</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Catches / Session</Text>
              <Text size="xl" fw={700}>2.4</Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Session History */}
        <div>
          <Title order={4} mb="md">Recent Sessions</Title>
          <Stack gap="md">
            {mockSessions.map((session) => (
              <Card key={session.id} withBorder radius="md" p="md" className="transition-all hover:border-blue-500 cursor-pointer">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="md" wrap="nowrap">
                    <ThemeIcon size={48} radius="md" variant="light" color="blue">
                      <IconMapPin size={24} />
                    </ThemeIcon>
                    
                    <div>
                      <Text fw={600} size="lg">{session.location}</Text>
                      <Text size="sm" c="dimmed">{session.date}</Text>
                      
                      <Group gap="sm" mt="xs">
                        <Badge size="sm" variant="dot" color="blue" leftSection={<IconClock size={10} />}>
                          {session.duration}
                        </Badge>
                        <Badge size="sm" variant="dot" color="teal" leftSection={<IconFishHook size={10} />}>
                          {session.catches} Catches
                        </Badge>
                        <Badge size="sm" variant="dot" color="orange" leftSection={<IconSun size={10} />}>
                          {session.weather} ({session.temp})
                        </Badge>
                      </Group>
                    </div>
                  </Group>
                  
                  <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={18} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}
