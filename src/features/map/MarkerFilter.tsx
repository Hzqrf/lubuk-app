'use client';

import { useEffect, useState } from 'react';
import { Box, Group, Autocomplete, ActionIcon, Menu, Text } from '@mantine/core';
import { IconSearch, IconFilter, IconCheck } from '@tabler/icons-react';
import { useMarkerStore } from '@/lib/store/useMarkerStore';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';

export function MarkerFilter() {
  const activeFilter = useMarkerStore((state) => state.activeFilter);
  const setActiveFilter = useMarkerStore((state) => state.setActiveFilter);
  const { species, fetchSpecies } = useSpeciesStore();

  const [searchValue, setSearchValue] = useState(activeFilter === 'All' ? '' : activeFilter);

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  // Sync search value if activeFilter changes externally
  useEffect(() => {
    setSearchValue(activeFilter === 'All' ? '' : activeFilter);
  }, [activeFilter]);

  const searchData = [
    { value: 'All', label: 'All Species' },
    ...species.map((s) => ({
      value: s.name,
      label: `${s.emoji} ${s.name}`,
    })),
  ];

  const handleSearchSubmit = (val: string) => {
    setSearchValue(val);
    if (!val.trim() || val === 'All') {
      setActiveFilter('All');
    } else {
      setActiveFilter(val);
    }
  };

  return (
    <Box
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        width: '100%',
        maxWidth: 500,
        padding: '0 16px',
      }}
    >
      <Group gap="xs" wrap="nowrap">
        <Autocomplete
          radius="xl"
          size="md"
          placeholder="Search catches, species or notes..."
          leftSection={<IconSearch size={18} />}
          data={searchData.map(d => d.value)}
          value={searchValue}
          onChange={setSearchValue}
          onOptionSubmit={(val) => handleSearchSubmit(val)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit(searchValue);
            }
          }}
          style={{ flexGrow: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 32 }}
          styles={{
            input: {
              border: 'none',
              backgroundColor: 'var(--mantine-color-body)',
            }
          }}
        />

        <Menu shadow="md" width={220} position="bottom-end" radius="md">
          <Menu.Target>
            <ActionIcon
              size="42px"
              radius="xl"
              variant="filled"
              color="blue"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', flexShrink: 0 }}
            >
              <IconFilter size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Filter by Species</Menu.Label>
            <Menu.Item
              onClick={() => handleSearchSubmit('All')}
              fw={activeFilter === 'All' ? 700 : 400}
              rightSection={activeFilter === 'All' && <IconCheck size={16} className="text-blue-500" />}
            >
              All Species
            </Menu.Item>
            {species.map((s) => (
              <Menu.Item
                key={s.name}
                onClick={() => handleSearchSubmit(s.name)}
                leftSection={<Text size="lg">{s.emoji}</Text>}
                fw={activeFilter === s.name ? 700 : 400}
                rightSection={activeFilter === s.name && <IconCheck size={16} className="text-blue-500" />}
              >
                {s.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
