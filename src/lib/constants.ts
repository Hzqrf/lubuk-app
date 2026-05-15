export const FISH_SPECIES = [
  { value: 'Haruan', label: 'Haruan', color: 'green', emoji: '🐟' },
  { value: 'Toman', label: 'Toman', color: 'red', emoji: '🐡' },
  { value: 'Patin', label: 'Patin', color: 'blue', emoji: '🐋' },
  { value: 'Peacock Bass', label: 'Peacock Bass', color: 'yellow', emoji: '🐠' },
  { value: 'Tilapia', label: 'Tilapia', color: 'teal', emoji: '🎣' },
] as const;

export const MAPBOX_DEFAULT_CENTER = {
  longitude: 101.6869, // KL as fallback
  latitude: 3.1390,
  zoom: 12,
};
