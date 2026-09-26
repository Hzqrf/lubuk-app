'use client';

import React from 'react';
import { 
  Container, 
  Card, 
  Text, 
  Group, 
  Badge, 
  Stack, 
  Title,
  Avatar,
  Tabs,
  Table
} from '@mantine/core';
import { IconTrophy, IconMedal } from '@tabler/icons-react';

const mockLeaderboard = [
  { rank: 1, name: 'Azwan Ali', avatar: 'https://i.pravatar.cc/150?u=1', score: 1450, badges: ['Legend'] },
  { rank: 2, name: 'Khairul Aming', avatar: 'https://i.pravatar.cc/150?u=2', score: 1200, badges: ['Master'] },
  { rank: 3, name: 'Syafiq Kyle', avatar: 'https://i.pravatar.cc/150?u=3', score: 980, badges: ['Expert'] },
  { rank: 4, name: 'Zizan Razak', avatar: 'https://i.pravatar.cc/150?u=4', score: 850, badges: ['Expert'] },
  { rank: 5, name: 'Johan', avatar: 'https://i.pravatar.cc/150?u=5', score: 720, badges: ['Explorer'] },
];

export function LeaderboardView() {
  const renderTopThree = () => (
    <Group justify="center" align="flex-end" gap="xl" mb="xl" mt="md">
      {/* 2nd Place */}
      <Stack align="center" gap="xs">
        <Avatar src={mockLeaderboard[1].avatar} size={80} radius="100%" className="border-4 border-gray-300" />
        <Badge color="gray" variant="filled" size="lg">#2</Badge>
        <Text fw={600}>{mockLeaderboard[1].name}</Text>
        <Text size="sm" c="dimmed">{mockLeaderboard[1].score} pts</Text>
      </Stack>
      
      {/* 1st Place */}
      <Stack align="center" gap="xs" style={{ transform: 'translateY(-20px)' }}>
        <IconTrophy size={40} className="text-yellow-500 mb-1" />
        <Avatar src={mockLeaderboard[0].avatar} size={100} radius="100%" className="border-4 border-yellow-400" />
        <Badge color="yellow" variant="filled" size="xl">#1</Badge>
        <Text fw={700} size="lg">{mockLeaderboard[0].name}</Text>
        <Text size="md" c="dimmed" fw={600}>{mockLeaderboard[0].score} pts</Text>
      </Stack>

      {/* 3rd Place */}
      <Stack align="center" gap="xs">
        <Avatar src={mockLeaderboard[2].avatar} size={80} radius="100%" className="border-4 border-orange-400" />
        <Badge color="orange" variant="filled" size="lg">#3</Badge>
        <Text fw={600}>{mockLeaderboard[2].name}</Text>
        <Text size="sm" c="dimmed">{mockLeaderboard[2].score} pts</Text>
      </Stack>
    </Group>
  );

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2} c="blue.6">Leaderboards</Title>
            <Text c="dimmed" size="sm">Top anglers based on reputation and catches</Text>
          </div>
        </Group>

        <Tabs defaultValue="global" radius="md">
          <Tabs.List>
            <Tabs.Tab value="global">Global</Tabs.Tab>
            <Tabs.Tab value="state">By State</Tabs.Tab>
            <Tabs.Tab value="groups">Group Rankings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="global" pt="xl">
            {renderTopThree()}

            <Card withBorder radius="md" p={0}>
              <Table verticalSpacing="sm" striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '80px' }}>Rank</Table.Th>
                    <Table.Th>Angler</Table.Th>
                    <Table.Th style={{ width: '120px' }}>Rank Status</Table.Th>
                    <Table.Th style={{ width: '100px', textAlign: 'right' }}>Score</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {mockLeaderboard.slice(3).map((user) => (
                    <Table.Tr key={user.rank}>
                      <Table.Td>
                        <Text fw={600} c="dimmed">#{user.rank}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar src={user.avatar} size={32} radius="xl" />
                          <Text fw={500} size="sm">{user.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color="blue">{user.badges[0]}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text fw={600}>{user.score}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
