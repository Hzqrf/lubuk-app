'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { useMantineColorScheme, Notification, Center, Loader } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';

import { useMarkerStore, MarkerData } from '@/lib/store/useMarkerStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSocialStore } from '@/lib/store/useSocialStore';
import { useSpeciesStore } from '@/lib/store/useSpeciesStore';
import { MAPBOX_DEFAULT_CENTER } from '@/lib/constants';
import { FloatingActions } from './FloatingActions';
import { AddMarkerDrawer } from './AddMarkerDrawer';
import { MarkerPopup } from './MarkerPopup';
import { MarkerFilter } from './MarkerFilter';

// Import New Features
import { HeatmapLayer } from '@/features/heatmap/HeatmapLayer';
import { NearbyCatches } from '@/features/nearby/NearbyCatches';
import { TrendingSpots } from '@/features/trending/TrendingSpots';
import { NotificationPrompt } from '@/features/notifications/NotificationPrompt';
import { useTrendingStore } from '@/lib/store/useTrendingStore';
import { WeatherDrawer } from '@/features/weather/WeatherDrawer';

// Sub-component to handle map clicks and interactions
function MapInteractions({
  isAddingMode,
  setIsAddingMode,
  setNewMarkerCoords,
  setDrawerOpened,
  setSelectedMarker
}: {
  isAddingMode: boolean;
  setIsAddingMode: (v: boolean) => void;
  setNewMarkerCoords: (coords: { lat: number; lng: number } | null) => void;
  setDrawerOpened: (v: boolean) => void;
  setSelectedMarker: (marker: MarkerData | null) => void;
}) {
  const map = useMapEvents({
    click(e) {
      if (isAddingMode) {
        setNewMarkerCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        setDrawerOpened(true);
        setIsAddingMode(false);
      } else {
        setSelectedMarker(null);
      }
    },
  });

  useEffect(() => {
    map.getContainer().style.cursor = isAddingMode ? 'crosshair' : 'grab';
  }, [isAddingMode, map]);

  return null;
}

// Map Controller for flying to location
function MapController({
  locateUserTrigger,
  setIsLocating,
  setUserLocation
}: {
  locateUserTrigger: number;
  setIsLocating: (v: boolean) => void;
  setUserLocation: (c: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (locateUserTrigger > 0) {
      setIsLocating(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            map.flyTo([latitude, longitude], 14, { duration: 1.5 });
            setIsLocating(false);
          },
          () => {
            console.warn('Unable to retrieve location');
            setIsLocating(false);
          },
          { timeout: 10000 }
        );
      } else {
        setIsLocating(false);
      }
    }
  }, [locateUserTrigger, map, setIsLocating, setUserLocation]);

  return null;
}

// Map Instance Capturer component
function MapInstanceCapture({ setMap }: { setMap: (map: any) => void }) {
  const map = useMap();
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
}

export default function MapComponent() {
  const { colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  const initAuth = useAuthStore((state) => state.initialize);
  const fetchCatches = useMarkerStore((state) => state.fetchCatches);

  const markers = useMarkerStore((state) => state.markers);
  const selectedMarker = useMarkerStore((state) => state.selectedMarker);
  const setSelectedMarker = useMarkerStore((state) => state.setSelectedMarker);
  const activeFilter = useMarkerStore((state) => state.activeFilter);

  // New GIS states
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [heatmapTimeFilter, setHeatmapTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [nearbyOpened, setNearbyOpened] = useState(false);
  const [trendingOpened, setTrendingOpened] = useState(false);
  const [weatherOpened, setWeatherOpened] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Trending states and calculations
  const trendingSpots = useTrendingStore((state) => state.trendingSpots);
  const activeSpotId = useTrendingStore((state) => state.activeSpotId);
  const computeTrendingSpots = useTrendingStore((state) => state.computeTrendingSpots);
  const likes = useSocialStore((state) => state.likes);
  const comments = useSocialStore((state) => state.comments);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locateUserTrigger, setLocateUserTrigger] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { fetchSpecies, getByName } = useSpeciesStore();

  useEffect(() => {
    initAuth();
    fetchCatches();
    fetchSpecies();

    // Fix Leaflet marker icons in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    setMounted(true);
  }, [initAuth, fetchCatches]);

  // Compute trending spots locally on updates
  useEffect(() => {
    if (markers.length > 0) {
      computeTrendingSpots(markers, likes, comments);
    }
  }, [markers, likes, comments, computeTrendingSpots]);

  const handleLocateMe = () => setLocateUserTrigger((prev) => prev + 1);

  const getCustomIcon = (speciesValue: string, isSelected: boolean) => {
    const speciesInfo = getByName(speciesValue);
    const colors: Record<string, string> = {
      green: '#2b8a3e',
      red: '#c92a2a',
      blue: '#1864ab',
      yellow: '#f59f00',
      teal: '#087f5b',
      purple: '#7048e8',
      orange: '#e8590c',
    };
    const color = speciesInfo?.color ? colors[speciesInfo.color] ?? '#1864ab' : '#1864ab';
    const emoji = speciesInfo?.emoji ?? '🎣';
    const scale = isSelected ? 1.25 : 1;

    const htmlString = renderToString(
      <div style={{ transition: 'transform 0.2s', transform: `scale(${scale})`, position: 'relative' }}>
        <IconMapPinFilled size={40} color={color} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
        <div style={{ position: 'absolute', top: 4, left: 0, right: 0, textAlign: 'center', fontSize: 16 }}>
          {emoji}
        </div>
      </div>
    );

    return L.divIcon({
      html: htmlString,
      className: 'custom-leaflet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -44],
    });
  };

  const getTempIcon = () => {
    const htmlString = renderToString(
      <IconMapPinFilled size={40} color="gray" style={{ opacity: 0.5 }} />
    );
    return L.divIcon({
      html: htmlString,
      className: 'custom-leaflet-marker-temp',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  const getUserLocationIcon = () => {
    const htmlString = renderToString(
      <div style={{
        width: 20,
        height: 20,
        backgroundColor: '#228be6',
        border: '3px solid white',
        borderRadius: '50%',
        boxShadow: '0 0 0 4px rgba(34,139,230,0.3)',
      }} />
    );
    return L.divIcon({
      html: htmlString,
      className: 'custom-leaflet-user-location',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  if (!mounted) return <Center h="100%"><Loader color="blue" /></Center>;

  const filteredMarkers = activeFilter === 'All'
    ? markers
    : markers.filter((m) => m.species === activeFilter);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MarkerFilter />

      <MapContainer
        center={[MAPBOX_DEFAULT_CENTER.latitude, MAPBOX_DEFAULT_CENTER.longitude]}
        zoom={MAPBOX_DEFAULT_CENTER.zoom}
        style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 1 }}
        zoomControl={false}
      >
        <MapInstanceCapture setMap={setMapInstance} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            colorScheme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        <MapController
          locateUserTrigger={locateUserTrigger}
          setIsLocating={setIsLocating}
          setUserLocation={setUserLocation}
        />
        <MapInteractions
          isAddingMode={isAddingMode}
          setIsAddingMode={setIsAddingMode}
          setNewMarkerCoords={setNewMarkerCoords}
          setDrawerOpened={setDrawerOpened}
          setSelectedMarker={setSelectedMarker}
        />

        {/* Heatmap Layer */}
        <HeatmapLayer
          visible={heatmapVisible}
          timeFilter={heatmapTimeFilter}
          speciesFilter={activeFilter}
          markers={markers}
        />

        {/* Trending spots pulsing boundaries */}
        {trendingSpots.map((spot) => (
          <Circle
            key={spot.id}
            center={[spot.latitude, spot.longitude]}
            radius={1000} // 1km hotspot radius boundary
            pathOptions={{
              color: activeSpotId === spot.id ? '#f76707' : '#e8590c',
              fillColor: '#f76707',
              fillOpacity: activeSpotId === spot.id ? 0.35 : 0.12,
              weight: activeSpotId === spot.id ? 3 : 1,
              dashArray: activeSpotId === spot.id ? '5, 5' : undefined,
            }}
          />
        ))}

        {/* Clustered catch markers */}
        <MarkerClusterGroup chunkedLoading>
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={getCustomIcon(marker.species, selectedMarker?.id === marker.id)}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e.originalEvent);
                  setSelectedMarker(marker);
                },
              }}
            >
              {selectedMarker?.id === marker.id && (
                <Popup className="custom-leaflet-popup" closeButton={false} autoPan={true} autoPanPadding={[20, 80]}>
                  <MarkerPopup marker={marker} onClose={() => setSelectedMarker(null)} />
                </Popup>
              )}
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Temporary Adding Marker */}
        {newMarkerCoords && !isAddingMode && drawerOpened && (
          <Marker position={[newMarkerCoords.lat, newMarkerCoords.lng]} icon={getTempIcon()} />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={getUserLocationIcon()}>
            <Popup className="custom-leaflet-popup" closeButton={false} autoPan={false}>
              <div style={{
                padding: '6px 12px',
                background: 'var(--mantine-color-body)',
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                fontSize: 14,
                fontWeight: 600,
              }}>
                📍 You are here
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <FloatingActions
        onLocateMe={handleLocateMe}
        onAddMarker={() => {
          setIsAddingMode(!isAddingMode);
          if (drawerOpened) setDrawerOpened(false);
          setSelectedMarker(null);
        }}
        isAddingMode={isAddingMode}
        isLocating={isLocating}
        heatmapVisible={heatmapVisible}
        onToggleHeatmap={() => setHeatmapVisible(!heatmapVisible)}
        onOpenNearby={() => setNearbyOpened(true)}
        onOpenTrending={() => setTrendingOpened(true)}
        onOpenWeather={() => setWeatherOpened(true)}
      />

      <AddMarkerDrawer
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false);
          setNewMarkerCoords(null);
        }}
        coordinates={newMarkerCoords}
      />

      {isAddingMode && (
        <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Notification title="Add Catch" color="blue" onClose={() => setIsAddingMode(false)}>
            Tap anywhere on the map to place a marker.
          </Notification>
        </div>
      )}

      {/* Feature Side Drawers */}
      <NearbyCatches
        opened={nearbyOpened}
        onClose={() => setNearbyOpened(false)}
        userCoords={userLocation}
        mapInstance={mapInstance}
      />

      <TrendingSpots
        opened={trendingOpened}
        onClose={() => setTrendingOpened(false)}
        mapInstance={mapInstance}
      />

      <WeatherDrawer
        opened={weatherOpened}
        onClose={() => setWeatherOpened(false)}
        userCoords={userLocation}
        mapInstance={mapInstance}
      />

      {/* Notification Consent Opt-in banner */}
      <NotificationPrompt />
    </div>
  );
}

