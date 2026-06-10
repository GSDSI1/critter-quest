export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 480;
export const TILE_SIZE = 16;
export const SCALE = 3;

export const COLORS = {
  bg: 0x1a1a2e,
  panel: 0x16213e,
  panelBorder: 0x0f3460,
  accent: 0xe94560,
  gold: 0xf5c542,
  text: 0xf0f0f0,
  textDim: 0x8899aa,
  hpGreen: 0x4ade80,
  hpYellow: 0xfbbf24,
  hpRed: 0xef4444,
  grass: 0x3d8b37,
  grassDark: 0x2d6b27,
  path: 0xc4a574,
  water: 0x3b82f6,
  wall: 0x6b5344,
  roof: 0xb91c1c,
  roofLight: 0xdc2626,
};

export type ElementType = 'flame' | 'tide' | 'leaf' | 'volt' | 'stone' | 'shadow';

export const TYPE_COLORS: Record<ElementType, number> = {
  flame: 0xff6b35,
  tide: 0x3b82f6,
  leaf: 0x22c55e,
  volt: 0xfacc15,
  stone: 0xa8a29e,
  shadow: 0x7c3aed,
};

export const TYPE_NAMES: Record<ElementType, string> = {
  flame: 'Flame',
  tide: 'Tide',
  leaf: 'Leaf',
  volt: 'Volt',
  stone: 'Stone',
  shadow: 'Shadow',
};

/** type -> types it deals 2x damage to */
export const TYPE_CHART: Record<ElementType, ElementType[]> = {
  flame: ['leaf', 'stone'],
  tide: ['flame', 'stone'],
  leaf: ['tide', 'stone'],
  volt: ['tide', 'leaf'],
  stone: ['flame', 'volt'],
  shadow: ['shadow'],
};

export function typeMultiplier(attack: ElementType, defend: ElementType): number {
  if (TYPE_CHART[attack]?.includes(defend)) return 2;
  if (TYPE_CHART[defend]?.includes(attack)) return 0.5;
  return 1;
}

export function typeLabel(mult: number): string {
  if (mult >= 2) return "It's super effective!";
  if (mult <= 0.5) return "It's not very effective...";
  return '';
}
