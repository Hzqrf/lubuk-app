'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { useMantineColorScheme, Notification, Center, Loader, Text } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';

import { useMarkerStore, MarkerData } from '@/lib/store/useMarkerStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MAPBOX_DEFAULT_CENTER, FISH_SPECIES } from '@/lib/constants';
import { FloatingActions } from './FloatingActions';
import { AddMarkerDrawer } from './AddMarkerDrawer';
import { MarkerPopup } from './MarkerPopup';
import { MarkerFilter } from './MarkerFilter';

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
function MapController({ locateUserTrigger, setIsLocating, setUserLocation }: { locateUserTrigger: number, setIsLocating: (v: boolean) => void, setUserLocation: (c: {lat: number, lng: number}) => void }) {
  const map = useMap();
  useEffect(() => {
    if (locateUserTrigger > 0) {
      setIsLocating(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            map.flyTo([latitude, longitude], 14, { duration: 2 });
            setIsLocating(false);
          },
          (error) => {
            alert('Unable to retrieve your location');
            setIsLocating(false);
          }
        );
      } else {
        alert('Geolocation is not supported by your browser');
        setIsLocating(false);
      }
    }
  }, [locateUserTrigger, map, setIsLocating]);

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

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locateUserTrigger, setLocateUserTrigger] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Initialize Auth and Data
    initAuth();
    fetchCatches();

    // Fix Leaflet marker icons in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    setMounted(true);
  }, [initAuth, fetchCatches]);

  const handleLocateMe = () => {
    setLocateUserTrigger((prev) => prev + 1);
  };

  const getCustomIcon = (speciesValue: string, isSelected: boolean) => {
    const species = FISH_SPECIES.find((s) => s.value === speciesValue);
    const colors: Record<string, string> = {
      green: '#2b8a3e',
      red: '#c92a2a',
      blue: '#1864ab',
      yellow: '#f59f00',
      teal: '#087f5b',
    };
    const color = species?.color ? colors[species.color] : '#1864ab';
    const scale = isSelected ? 1.2 : 1;

    const htmlString = renderToString(
      <div style={{ transition: 'transform 0.2s', transform: `scale(${scale})`, position: 'relative' }}>
        <IconMapPinFilled size={40} color={color} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
        <div style={{ position: 'absolute', top: 4, left: 0, right: 0, textAlign: 'center', fontSize: 16 }}>
          {species?.emoji}
        </div>
      </div>
    );

    return L.divIcon({
      html: htmlString,
      className: 'custom-leaflet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40], 
      popupAnchor: [0, -40], 
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
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      }} />
    );
    return L.divIcon({
      html: htmlString,
      className: 'custom-leaflet-user-location',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  if (!mounted) return <Center h="100vh"><Loader /></Center>;

  const filteredMarkers = activeFilter === 'All' 
    ? markers 
    : markers.filter(m => m.species === activeFilter);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MarkerFilter />
      
      <MapContainer
        center={[MAPBOX_DEFAULT_CENTER.latitude, MAPBOX_DEFAULT_CENTER.longitude]}
        zoom={MAPBOX_DEFAULT_CENTER.zoom}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            colorScheme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        <MapController locateUserTrigger={locateUserTrigger} setIsLocating={setIsLocating} setUserLocation={setUserLocation} />
        <MapInteractions
          isAddingMode={isAddingMode}
          setIsAddingMode={setIsAddingMode}
          setNewMarkerCoords={setNewMarkerCoords}
          setDrawerOpened={setDrawerOpened}
          setSelectedMarker={setSelectedMarker}
        />

        {/* Render filtered markers */}
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
              <Popup className="custom-leaflet-popup" closeButton={false} autoPan={false}>
                <MarkerPopup marker={marker} onClose={() => setSelectedMarker(null)} />
              </Popup>
            )}
          </Marker>
        ))}

        {/* Temporary Adding Marker */}
        {newMarkerCoords && !isAddingMode && drawerOpened && (
          <Marker position={[newMarkerCoords.lat, newMarkerCoords.lng]} icon={getTempIcon()} />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={getUserLocationIcon()}>
            <Popup className="custom-leaflet-popup" closeButton={false} autoPan={false}>
              <div style={{ padding: '6px 12px', background: 'white', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600, color: '#171717' }}>
                You are here
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
        <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Notification title="Add Catch" color="blue" onClose={() => setIsAddingMode(false)}>
            Tap anywhere on the map to place a marker.
          </Notification>
        </div>
      )}
    </div>
  );
}
