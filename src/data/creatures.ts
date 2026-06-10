import type { ElementType } from './types';

export interface CreatureDef {
  id: string;
  name: string;
  types: ElementType[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  moves: string[];
  catchRate: number;
  expYield: number;
  color: number;
  shape: 'blob' | 'quadruped' | 'serpent' | 'avian' | 'humanoid' | 'crystalline';
  description: string;
  dexNumber: number;
  ability?: string;
  habitat?: string;
  height?: number;
  weight?: number;
}

export const CREATURES: Record<string, CreatureDef> = {
  emberpup: {
    id: 'emberpup', name: 'Emberpup', types: ['flame'], dexNumber: 1,
    baseStats: { hp: 45, atk: 60, def: 45, spa: 55, spd: 50, spe: 65 },
    moves: ['scratch', 'ember', 'blaze', 'growl'],
    catchRate: 45, expYield: 62, color: 0xff6b35, shape: 'quadruped',
    description: 'A fiery pup whose tail flame never goes out.',
  },
  flamewyrm: {
    id: 'flamewyrm', name: 'Flamewyrm', types: ['flame'], dexNumber: 2,
    baseStats: { hp: 60, atk: 75, def: 55, spa: 80, spd: 60, spe: 70 },
    moves: ['ember', 'blaze', 'inferno', 'scratch'],
    catchRate: 25, expYield: 145, color: 0xff4500, shape: 'serpent',
    description: 'An evolved fire serpent that coils around volcanoes.',
  },
  infernox: {
    id: 'infernox', name: 'Infernox', types: ['flame', 'shadow'], dexNumber: 3,
    baseStats: { hp: 75, atk: 90, def: 70, spa: 110, spd: 75, spe: 85 },
    moves: ['blaze', 'inferno', 'darkpulse', 'shadowclaw'],
    catchRate: 10, expYield: 240, color: 0xdc2626, shape: 'serpent',
    description: 'Its body burns so hot that shadows flee from its path.',
  },
  aqualet: {
    id: 'aqualet', name: 'Aqualet', types: ['tide'], dexNumber: 4,
    baseStats: { hp: 50, atk: 45, def: 55, spa: 60, spd: 55, spe: 50 },
    moves: ['tackle', 'splash', 'tidal', 'growl'],
    catchRate: 45, expYield: 63, color: 0x3b82f6, shape: 'blob',
    description: 'A playful water spirit that loves puddles.',
  },
  tidefin: {
    id: 'tidefin', name: 'Tidefin', types: ['tide'], dexNumber: 5,
    baseStats: { hp: 65, atk: 55, def: 70, spa: 85, spd: 75, spe: 55 },
    moves: ['splash', 'tidal', 'tsunami', 'tackle'],
    catchRate: 25, expYield: 148, color: 0x1d4ed8, shape: 'serpent',
    description: 'Glides through rivers like a living wave.',
  },
  aquadel: {
    id: 'aquadel', name: 'Aquadel', types: ['tide'], dexNumber: 6,
    baseStats: { hp: 80, atk: 65, def: 85, spa: 110, spd: 95, spe: 60 },
    moves: ['tidal', 'tsunami', 'icebeam', 'splash'],
    catchRate: 10, expYield: 245, color: 0x0ea5e9, shape: 'serpent',
    description: 'Legends say it can calm any storm with a single cry.',
  },
  leafkit: {
    id: 'leafkit', name: 'Leafkit', types: ['leaf'], dexNumber: 7,
    baseStats: { hp: 55, atk: 50, def: 50, spa: 50, spd: 55, spe: 45 },
    moves: ['scratch', 'vine', 'leafblade', 'photosynthesis'],
    catchRate: 45, expYield: 64, color: 0x22c55e, shape: 'quadruped',
    description: 'Its leafy ears detect rain from miles away.',
  },
  vineclaw: {
    id: 'vineclaw', name: 'Vineclaw', types: ['leaf'], dexNumber: 8,
    baseStats: { hp: 65, atk: 70, def: 60, spa: 65, spd: 65, spe: 55 },
    moves: ['vine', 'leafblade', 'rockthrow', 'sleep_powder'],
    catchRate: 30, expYield: 130, color: 0x16a34a, shape: 'quadruped',
    description: 'Vines wrap around its claws like living whips.',
  },
  thornbeast: {
    id: 'thornbeast', name: 'Thornbeast', types: ['leaf', 'stone'], dexNumber: 9,
    baseStats: { hp: 80, atk: 85, def: 75, spa: 60, spd: 70, spe: 40 },
    moves: ['vine', 'leafblade', 'rockthrow', 'boulder'],
    catchRate: 20, expYield: 160, color: 0x15803d, shape: 'quadruped',
    description: 'Armored in bark and thorns, it guards ancient forests.',
  },
  sparkbit: {
    id: 'sparkbit', name: 'Sparkbit', types: ['volt'], dexNumber: 10,
    baseStats: { hp: 40, atk: 45, def: 40, spa: 65, spd: 50, spe: 70 },
    moves: ['tackle', 'spark', 'thunderbolt', 'growl'],
    catchRate: 45, expYield: 60, color: 0xfacc15, shape: 'blob',
    description: 'Crackles with static when excited.',
  },
  voltwing: {
    id: 'voltwing', name: 'Voltwing', types: ['volt', 'leaf'], dexNumber: 11,
    baseStats: { hp: 55, atk: 60, def: 50, spa: 75, spd: 65, spe: 90 },
    moves: ['spark', 'thunderbolt', 'vine', 'thunderwave'],
    catchRate: 30, expYield: 130, color: 0xeab308, shape: 'avian',
    description: 'Storms follow wherever this electric bird flies.',
  },
  mossling: {
    id: 'mossling', name: 'Mossling', types: ['leaf'], dexNumber: 12,
    baseStats: { hp: 60, atk: 45, def: 60, spa: 45, spd: 60, spe: 35 },
    moves: ['tackle', 'vine', 'photosynthesis', 'growl'],
    catchRate: 55, expYield: 50, color: 0x4ade80, shape: 'blob',
    description: 'Soaks up sunlight and grows mossy patches.',
  },
  bloomoss: {
    id: 'bloomoss', name: 'Bloomoss', types: ['leaf'], dexNumber: 13,
    baseStats: { hp: 75, atk: 55, def: 75, spa: 70, spd: 80, spe: 40 },
    moves: ['vine', 'leafblade', 'sleep_powder', 'photosynthesis'],
    catchRate: 35, expYield: 120, color: 0x059669, shape: 'blob',
    description: 'Flowers bloom on its back every spring without fail.',
  },
  pebblite: {
    id: 'pebblite', name: 'Pebblite', types: ['stone'], dexNumber: 14,
    baseStats: { hp: 50, atk: 55, def: 70, spa: 30, spd: 40, spe: 25 },
    moves: ['tackle', 'rockthrow', 'boulder', 'growl'],
    catchRate: 50, expYield: 55, color: 0x78716c, shape: 'blob',
    description: 'A round rock critter that rolls downhill for fun.',
  },
  rockord: {
    id: 'rockord', name: 'Rockord', types: ['stone'], dexNumber: 15,
    baseStats: { hp: 70, atk: 85, def: 95, spa: 35, spd: 50, spe: 30 },
    moves: ['rockthrow', 'boulder', 'earthquake', 'tackle'],
    catchRate: 30, expYield: 130, color: 0x57534e, shape: 'quadruped',
    description: 'Its stone hide can shrug off boulders twice its size.',
  },
  shadeling: {
    id: 'shadeling', name: 'Shadeling', types: ['shadow'], dexNumber: 16,
    baseStats: { hp: 45, atk: 70, def: 45, spa: 70, spd: 55, spe: 75 },
    moves: ['scratch', 'shadowclaw', 'darkpulse', 'growl'],
    catchRate: 35, expYield: 90, color: 0x7c3aed, shape: 'humanoid',
    description: 'Appears only at dusk. Nobody knows where it sleeps.',
  },
  shadespecter: {
    id: 'shadespecter', name: 'Shadespecter', types: ['shadow'], dexNumber: 17,
    baseStats: { hp: 60, atk: 90, def: 60, spa: 95, spd: 70, spe: 95 },
    moves: ['shadowclaw', 'darkpulse', 'hypnosis', 'scratch'],
    catchRate: 20, expYield: 170, color: 0x5b21b6, shape: 'humanoid',
    description: 'Phases through walls and haunts moonlit ruins.',
  },
  crystalynx: {
    id: 'crystalynx', name: 'Crystalynx', types: ['stone', 'volt'], dexNumber: 18,
    baseStats: { hp: 70, atk: 80, def: 85, spa: 70, spd: 80, spe: 60 },
    moves: ['rockthrow', 'boulder', 'spark', 'thunderbolt'],
    catchRate: 15, expYield: 175, color: 0xa78bfa, shape: 'crystalline',
    description: 'Rare crystalline predator of mountain caves.',
    ability: 'levitate', habitat: 'Crystal Cave', height: 1.2, weight: 45,
  },
  cinderkit: {
    id: 'cinderkit', name: 'Cinderkit', types: ['flame'], dexNumber: 19,
    baseStats: { hp: 42, atk: 58, def: 42, spa: 52, spd: 48, spe: 62 },
    moves: ['scratch', 'ember', 'growl'],
    catchRate: 40, expYield: 58, color: 0xfb923c, shape: 'quadruped',
    description: 'A scrappy fire kitten found near volcanic routes.',
    ability: 'blaze', habitat: 'Route 3', height: 0.5, weight: 8,
  },
  emberlord: {
    id: 'emberlord', name: 'Emberlord', types: ['flame'], dexNumber: 20,
    baseStats: { hp: 78, atk: 95, def: 72, spa: 100, spd: 78, spe: 82 },
    moves: ['blaze', 'inferno', 'shadowclaw'],
    catchRate: 12, expYield: 220, color: 0xb91c1c, shape: 'humanoid',
    description: 'A battle-hardened flame warrior of volcanic peaks.',
    ability: 'flash_fire', habitat: 'Volcanic Path', height: 1.6, weight: 52,
  },
  geodeon: {
    id: 'geodeon', name: 'Geodeon', types: ['stone', 'volt'], dexNumber: 21,
    baseStats: { hp: 65, atk: 90, def: 100, spa: 55, spd: 60, spe: 35 },
    moves: ['rockthrow', 'boulder', 'spark'],
    catchRate: 25, expYield: 140, color: 0xa8a29e, shape: 'crystalline',
    description: 'Crystal veins pulse with electricity through its body.',
    ability: 'sturdy', habitat: 'Crystal Cave', height: 1.0, weight: 120,
  },
  mistral: {
    id: 'mistral', name: 'Mistral', types: ['volt', 'leaf'], dexNumber: 22,
    baseStats: { hp: 52, atk: 55, def: 48, spa: 78, spd: 62, spe: 88 },
    moves: ['spark', 'vine', 'thunderbolt'],
    catchRate: 30, expYield: 125, color: 0x7dd3fc, shape: 'avian',
    description: 'Rides coastal winds while crackling with static.',
    ability: 'static', habitat: 'Route 2', height: 0.9, weight: 14,
  },
  grimlet: {
    id: 'grimlet', name: 'Grimlet', types: ['shadow', 'stone'], dexNumber: 23,
    baseStats: { hp: 55, atk: 82, def: 70, spa: 75, spd: 65, spe: 68 },
    moves: ['shadowclaw', 'rockthrow', 'darkpulse'],
    catchRate: 22, expYield: 150, color: 0x581c87, shape: 'humanoid',
    description: 'Stone fists and shadowy aura make it a cave terror.',
    ability: 'shadow_tag', habitat: 'Volcanic Path', height: 1.1, weight: 38,
  },
  coralite: {
    id: 'coralite', name: 'Coralite', types: ['tide', 'stone'], dexNumber: 24,
    baseStats: { hp: 72, atk: 60, def: 88, spa: 72, spd: 90, spe: 42 },
    moves: ['splash', 'rockthrow', 'tidal'],
    catchRate: 28, expYield: 135, color: 0x06b6d4, shape: 'blob',
    description: 'A living coral colony that filters tide energy.',
    ability: 'water_absorb', habitat: 'Route 3', height: 0.8, weight: 55,
  },
  tidewisp: {
    id: 'tidewisp', name: 'Tidewisp', types: ['tide'], dexNumber: 25,
    baseStats: { hp: 48, atk: 42, def: 50, spa: 65, spd: 58, spe: 55 },
    moves: ['splash', 'tackle', 'growl'],
    catchRate: 42, expYield: 60, color: 0x38bdf8, shape: 'blob',
    description: 'A wisp of seawater that follows travelers.',
    ability: 'torrent', habitat: 'Route 3', height: 0.4, weight: 5,
  },
  thornling: {
    id: 'thornling', name: 'Thornling', types: ['leaf'], dexNumber: 26,
    baseStats: { hp: 58, atk: 62, def: 58, spa: 48, spd: 52, spe: 42 },
    moves: ['vine', 'tackle', 'leer'],
    catchRate: 48, expYield: 55, color: 0x84cc16, shape: 'quadruped',
    description: 'Tiny thorns cover its back as camouflage.',
    ability: 'overgrow', habitat: 'Route 2', height: 0.6, weight: 12,
  },
  voltite: {
    id: 'voltite', name: 'Voltite', types: ['volt'], dexNumber: 27,
    baseStats: { hp: 38, atk: 40, def: 38, spa: 70, spd: 48, spe: 75 },
    moves: ['spark', 'tackle', 'thunderwave'],
    catchRate: 44, expYield: 58, color: 0xfde047, shape: 'blob',
    description: 'Stores static in pebble-sized cells on its skin.',
    ability: 'static', habitat: 'Route 3', height: 0.3, weight: 4,
  },
};

export const STARTERS = ['emberpup', 'aqualet', 'leafkit'] as const;

export const DEX_ORDER = Object.values(CREATURES).sort((a, b) => a.dexNumber - b.dexNumber).map(c => c.id);

export function getCreature(id: string): CreatureDef {
  return CREATURES[id] ?? CREATURES.mossling;
}

export function totalSpecies(): number {
  return Object.keys(CREATURES).length;
}
