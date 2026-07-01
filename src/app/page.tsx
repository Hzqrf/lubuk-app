'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/features/map/MapComponent'), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ height: '100%' }}>
      <MapComponent />
    </main>
  );
}
