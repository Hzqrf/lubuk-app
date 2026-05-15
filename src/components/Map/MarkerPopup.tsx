'use client';

import { Card, Text, Group, Badge, CloseButton, Stack, Image } from '@mantine/core';
import { MarkerData } from '@/lib/store/useMarkerStore';
import { FISH_SPECIES } from '@/lib/constants';

interface MarkerPopupProps {
  marker: MarkerData;
  onClose: () => void;
}

export function MarkerPopup({ marker, onClose }: MarkerPopupProps) {
  const speciesInfo = FISH_SPECIES.find((s) => s.value === marker.species);

  return (
    <Card shadow="sm" p="md" radius="md" withBorder w={280}>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="xl">{speciesInfo?.emoji}</Text>
            <Text fw={600}>{marker.species}</Text>
          </Group>
          <CloseButton onClick={onClose} size="sm" />
        </Group>
      </Card.Section>

      {marker.image_url && (
        <Card.Section>
          <Image
            src={marker.image_url}
            height={160}
            alt="Fish catch"
            fallbackSrc="https://placehold.co/600x400?text=Placeholder"
            fit="cover"
          />
        </Card.Section>
      )}
      
      <Stack gap="xs" mt="md">
        <Badge color={speciesInfo?.color || 'blue'} variant="light">
          {new Date(marker.timestamp).toLocaleDateString()} {new Date(marker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Badge>
        {marker.note ? (
          <Text size="sm" c="dimmed">
            {marker.note}
          </Text>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No note provided.
          </Text>
        )}
      </Stack>
    </Card>
  );
}
