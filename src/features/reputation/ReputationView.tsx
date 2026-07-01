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
  ThemeIcon,
  Paper
} from '@mantine/core';
import { IconTrophy, IconStar, IconLock } from '@tabler/icons-react';

const mockReputation = {
  score: 850,
  rank: 'Expert',
  nextRank: 'Master Angler',
  nextRankScore: 1200,
};

const mockAchievements = [
  { id: '1', title: 'First Catch', description: 'Recorded your very first catch', icon: '🎣', unlocked: true },
  { id: '2', title: '10 Catches', description: 'Reached 10 total catches', icon: '🌟', unlocked: true },
  { id: '3', title: '100 Catches', description: 'Reached 100 total catches', icon: '💯', unlocked: false },
  { id: '4', title: 'Explorer', description: 'Visited 5 different locations', icon: '🗺️', unlocked: true },
  { id: '5', title: 'Haruan Hunter', description: 'Caught 5 Haruan', icon: '🐍', unlocked: false },
];

export function ReputationView() {
  const progressToNextRank = (mockReputation.score / mockReputation.nextRankScore) * 100;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2} c="blue.6">Reputation & Achievements</Title>
            <Text c="dimmed" size="sm">Your progress as an angler</Text>
          </div>
        </Group>

        {/* Reputation Card */}
        <Paper withBorder radius="md" p="xl" className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-lg">
          <Grid align="center">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Stack align="center" gap="xs">
                <ThemeIcon size={80} radius="100%" color="yellow" variant="light">
                  <IconStar size={40} />
                </ThemeIcon>
                <Title order={3}>{mockReputation.rank}</Title>
                <Text size="sm" c="blue.2">{mockReputation.score} Reputation Points</Text>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600}>Next Rank: {mockReputation.nextRank}</Text>
                  <Text fw={700} c="yellow.4">{mockReputation.nextRankScore} pts</Text>
                </Group>
                <Progress value={progressToNextRank} color="yellow" size="xl" radius="xl" striped animated />
                <Text size="sm" c="blue.2" align="right">
                  {mockReputation.nextRankScore - mockReputation.score} points to go
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Achievements Grid */}
        <div>
          <Title order={4} mb="md">Badges & Achievements</Title>
          <Grid>
            {mockAchievements.map((achievement) => (
              <Grid.Col span={{ base: 6, sm: 4, md: 3 }} key={achievement.id}>
                <Card 
                  withBorder 
                  radius="md" 
                  p="md" 
                  className={`text-center h-full transition-all hover:shadow-md ${!achievement.unlocked ? 'opacity-60 bg-gray-50 dark:bg-dark-7' : ''}`}
                >
                  <Stack align="center" gap="sm">
                    <div className="text-4xl relative">
                      {achievement.icon}
                      {!achievement.unlocked && (
                        <div className="absolute -bottom-2 -right-2 bg-gray-200 dark:bg-dark-5 rounded-full p-1">
                          <IconLock size={14} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Text fw={700} size="sm">{achievement.title}</Text>
                      <Text size="xs" c="dimmed" mt={4} lh={1.3}>
                        {achievement.description}
                      </Text>
                    </div>
                    {achievement.unlocked ? (
                      <Badge size="xs" color="green">Unlocked</Badge>
                    ) : (
                      <Badge size="xs" color="gray" variant="light">Locked</Badge>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>
      </Stack>
    </Container>
  );
}
