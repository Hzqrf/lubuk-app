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
  Avatar,
  Input,
  Tabs
} from '@mantine/core';
import { IconSearch, IconUsers, IconMapPin, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

const mockGroups = [
  {
    id: '1',
    name: 'Haruan Hunters Malaysia',
    description: 'A community dedicated to the art of hunting Channa Striata across Malaysia. Share spots, techniques, and catches!',
    cover_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600',
    members: 1250,
    location: 'Malaysia',
    isMember: true
  },
  {
    id: '2',
    name: 'Tasik Kenyir Anglers',
    description: 'Local and visiting anglers of Tasik Kenyir. Updates on water levels, active species, and recent catches.',
    cover_image: 'https://images.unsplash.com/photo-1518342407559-4b679aabf08e?auto=format&fit=crop&q=80&w=600',
    members: 840,
    location: 'Terengganu',
    isMember: false
  },
  {
    id: '3',
    name: 'Johor Saltwater Addicts',
    description: 'For those who love the smell of the sea. Jetty, kelong, and offshore fishing around Johor.',
    cover_image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&q=80&w=600',
    members: 3200,
    location: 'Johor',
    isMember: false
  }
];

export function GroupDirectory() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2} c="blue.6">Communities</Title>
            <Text c="dimmed" size="sm">Find and join fishing groups near you</Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />} 
            color="blue" 
            radius="md"
          >
            Create Group
          </Button>
        </Group>

        {/* Search */}
        <Input 
          size="md"
          placeholder="Search groups by name or location..." 
          leftSection={<IconSearch size={18} />} 
          radius="md"
        />

        <Tabs defaultValue="discover" radius="md">
          <Tabs.List>
            <Tabs.Tab value="discover">Discover</Tabs.Tab>
            <Tabs.Tab value="my_groups">My Groups</Tabs.Tab>
            <Tabs.Tab value="local">Local to Me</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="discover" pt="xl">
            <Grid>
              {mockGroups.map((group) => (
                <Grid.Col span={{ base: 12, sm: 6 }} key={group.id}>
                  <Card withBorder radius="md" p={0} className="transition-all hover:shadow-md cursor-pointer flex flex-col h-full">
                    <div className="relative h-32 w-full bg-gray-100">
                      <Image 
                        src={group.cover_image} 
                        alt={group.name} 
                        h="100%" 
                        fit="cover" 
                      />
                      <div className="absolute top-2 right-2">
                        {group.isMember && <Badge color="green" variant="filled">Joined</Badge>}
                      </div>
                    </div>
                    
                    <Stack p="md" gap="xs" style={{ flexGrow: 1 }}>
                      <Title order={4}>{group.name}</Title>
                      
                      <Group gap="sm" c="dimmed" size="sm">
                        <Group gap={4}>
                          <IconUsers size={14} />
                          <Text size="xs">{group.members} members</Text>
                        </Group>
                        <Group gap={4}>
                          <IconMapPin size={14} />
                          <Text size="xs">{group.location}</Text>
                        </Group>
                      </Group>
                      
                      <Text size="sm" lineClamp={2} style={{ flexGrow: 1 }}>
                        {group.description}
                      </Text>
                      
                      <Button 
                        variant={group.isMember ? 'light' : 'filled'} 
                        color={group.isMember ? 'gray' : 'blue'}
                        fullWidth 
                        mt="md"
                        radius="md"
                      >
                        {group.isMember ? 'Visit Group' : 'Join Group'}
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="my_groups" pt="xl">
             <Text c="dimmed">You are a member of 1 group.</Text>
             {/* Map over my groups here */}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
