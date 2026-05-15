'use client';

import { SegmentedControl, Box, Text } from '@mantine/core';
import { useMarkerStore, FishSpecies } from '@/lib/store/useMarkerStore';
import { FISH_SPECIES } from '@/lib/constants';

export function MarkerFilter() {
  const activeFilter = useMarkerStore((state) => state.activeFilter);
  const setActiveFilter = useMarkerStore((state) => state.setActiveFilter);

  const data = [
    { value: 'All', label: 'All' },
    ...FISH_SPECIES.map((s) => ({
      value: s.value,
      label: `${s.emoji} ${s.label}`,
    }))
  ];

  return (
    <Box 
      style={{ 
        position: 'absolute', 
        top: 16, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: 32,
        backgroundColor: 'var(--mantine-color-body)',
        padding: 4
      }}
    >
      <SegmentedControl
        radius="xl"
        size="sm"
        data={data}
        value={activeFilter}
        onChange={(val) => setActiveFilter(val as FishSpecies | 'All')}
        styles={{
          root: { backgroundColor: 'transparent' },
          label: { padding: '8px 16px', fontWeight: 600 }
        }}
      />
    </Box>
  );
}
