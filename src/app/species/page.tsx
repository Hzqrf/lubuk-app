import { Metadata } from 'next';
import { FishDex } from '@/features/species/FishDex';

export const metadata: Metadata = {
  title: 'FishDex | Lubuk',
  description: 'Your species collection and discovery.',
};

export default function SpeciesPage() {
  return <FishDex />;
}
