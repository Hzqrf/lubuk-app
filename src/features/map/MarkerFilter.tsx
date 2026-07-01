'use client';

import { useEffect } from 'react';
import { SegmentedControl, Box, ScrollArea } from '@mantine/core';
import { useMarkerStore } from '@/lib/store/useMarkerStore';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';

export function MarkerFilter() {
  const activeFilter = useMarkerStore((state) => state.activeFilter);
  const setActiveFilter = useMarkerStore((state) => state.setActiveFilter);
  const { species, fetchSpecies } = useSpeciesStore();

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  const data = [
    { value: 'All', label: 'All' },
    ...species.map((s) => ({
      value: s.name,
      label: `${s.emoji} ${s.name}`,
    })),
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
        padding: 4,
        maxWidth: 'calc(100vw - 160px)',
      }}
    >
      <ScrollArea scrollbarSize={0} type="never">
        <SegmentedControl
          radius="xl"
          size="sm"
          data={data}
          value={activeFilter}
          onChange={(val) => setActiveFilter(val)}
          styles={{
            root: { backgroundColor: 'transparent', flexWrap: 'nowrap' },
            label: { padding: '8px 14px', fontWeight: 600, whiteSpace: 'nowrap' },
          }}
        />
      </ScrollArea>
    </Box>
  );
}
