'use client';

import dynamic from 'next/dynamic';
import { Center, Loader } from '@mantine/core';

// Dynamically import the map component with ssr disabled
// This is required because Leaflet relies on the window object
const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), {
  ssr: false,
  loading: () => (
    <Center h="100vh">
      <Loader color="blue" />
    </Center>
  ),
});

export default function Home() {
  return (
    <main style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <MapComponent />
    </main>
  );
}
