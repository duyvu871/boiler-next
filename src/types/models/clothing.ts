import type { ModelInfo } from './types';

// Central list of models used by the Playground. Files live under public/models.
// This is intentionally a simple array to keep render order predictable and allow
// the UI overlay to report which item is loading.
export const MODELS_TO_LOAD: ModelInfo[] = [
  { name: 'female', url: '/models/female.glb', category: 'body', defaultVisible: true, scale: 1 },
  { name: 'bodice', url: '/models/bodice.glb', category: 'top', defaultVisible: false },
  { name: 'shirt', url: '/models/shirt.glb', category: 'top', defaultVisible: false },
  { name: 'skirt', url: '/models/skirt.glb', category: 'bottom', defaultVisible: false },
];

export const CLOTHING_CATEGORIES: Record<'top' | 'bottom', string[]> = {
  top: ['bodice', 'shirt'],
  bottom: ['skirt'],
};
