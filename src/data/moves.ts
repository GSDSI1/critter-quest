import type { ElementType } from './types';

export interface MoveDef {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  accuracy: number;
  pp: number;
  category: 'physical' | 'special' | 'status';
  effect?: 'heal' | 'sleep' | 'boost-atk' | 'boost-def' | 'burn' | 'paralyze' | 'poison' | 'thunderwave' | 'hypnosis';
  effectChance?: number;
  effectValue?: number;
  /** Who receives stat-stage changes from boost-* moves. Defaults to 'foe'. */
  effectTarget?: 'self' | 'foe';
}

export const MOVES: Record<string, MoveDef> = {
  tackle: { id: 'tackle', name: 'Tackle', type: 'stone', power: 40, accuracy: 100, pp: 35, category: 'physical' },
  scratch: { id: 'scratch', name: 'Scratch', type: 'stone', power: 40, accuracy: 100, pp: 35, category: 'physical' },
  ember: { id: 'ember', name: 'Ember', type: 'flame', power: 40, accuracy: 100, pp: 25, category: 'special', effect: 'burn', effectChance: 10 },
  blaze: { id: 'blaze', name: 'Blaze Rush', type: 'flame', power: 70, accuracy: 95, pp: 15, category: 'special', effect: 'burn', effectChance: 15 },
  inferno: { id: 'inferno', name: 'Inferno', type: 'flame', power: 100, accuracy: 85, pp: 5, category: 'special', effect: 'burn', effectChance: 30 },
  splash: { id: 'splash', name: 'Splash Jet', type: 'tide', power: 40, accuracy: 100, pp: 25, category: 'special' },
  tidal: { id: 'tidal', name: 'Tidal Wave', type: 'tide', power: 70, accuracy: 95, pp: 15, category: 'special' },
  tsunami: { id: 'tsunami', name: 'Tsunami', type: 'tide', power: 100, accuracy: 85, pp: 5, category: 'special' },
  icebeam: { id: 'icebeam', name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, pp: 10, category: 'special', effect: 'sleep', effectChance: 10 },
  frostbite: { id: 'frostbite', name: 'Frost Bite', type: 'ice', power: 55, accuracy: 100, pp: 25, category: 'special', effect: 'sleep', effectChance: 10 },
  iceshard: { id: 'iceshard', name: 'Ice Shard', type: 'ice', power: 40, accuracy: 100, pp: 30, category: 'physical' },
  blizzard: { id: 'blizzard', name: 'Blizzard', type: 'ice', power: 100, accuracy: 85, pp: 5, category: 'special', effect: 'sleep', effectChance: 10 },
  psybeam: { id: 'psybeam', name: 'Psybeam', type: 'psychic', power: 65, accuracy: 100, pp: 20, category: 'special' },
  mindblast: { id: 'mindblast', name: 'Mind Blast', type: 'psychic', power: 90, accuracy: 95, pp: 10, category: 'special' },
  calm_mind: { id: 'calm_mind', name: 'Calm Mind', type: 'psychic', power: 0, accuracy: 100, pp: 20, category: 'status', effect: 'boost-atk', effectValue: 1, effectTarget: 'self' },
  vine: { id: 'vine', name: 'Vine Whip', type: 'leaf', power: 40, accuracy: 100, pp: 25, category: 'physical' },
  leafblade: { id: 'leafblade', name: 'Leaf Blade', type: 'leaf', power: 70, accuracy: 95, pp: 15, category: 'physical' },
  photosynthesis: { id: 'photosynthesis', name: 'Photosynthesis', type: 'leaf', power: 0, accuracy: 100, pp: 10, category: 'status', effect: 'heal', effectValue: 0.5 },
  sleep_powder: { id: 'sleep_powder', name: 'Sleep Powder', type: 'leaf', power: 0, accuracy: 75, pp: 15, category: 'status', effect: 'sleep' },
  spark: { id: 'spark', name: 'Spark', type: 'volt', power: 40, accuracy: 100, pp: 25, category: 'special', effect: 'paralyze', effectChance: 10 },
  thunderbolt: { id: 'thunderbolt', name: 'Thunderbolt', type: 'volt', power: 70, accuracy: 95, pp: 15, category: 'special', effect: 'paralyze', effectChance: 10 },
  thunderwave: { id: 'thunderwave', name: 'Thunder Wave', type: 'volt', power: 0, accuracy: 90, pp: 20, category: 'status', effect: 'paralyze' },
  rockthrow: { id: 'rockthrow', name: 'Rock Throw', type: 'stone', power: 50, accuracy: 90, pp: 20, category: 'physical' },
  boulder: { id: 'boulder', name: 'Boulder Smash', type: 'stone', power: 75, accuracy: 90, pp: 10, category: 'physical' },
  earthquake: { id: 'earthquake', name: 'Earthquake', type: 'stone', power: 100, accuracy: 100, pp: 10, category: 'physical' },
  shadowclaw: { id: 'shadowclaw', name: 'Shadow Claw', type: 'shadow', power: 60, accuracy: 95, pp: 15, category: 'physical' },
  darkpulse: { id: 'darkpulse', name: 'Dark Pulse', type: 'shadow', power: 80, accuracy: 90, pp: 10, category: 'special' },
  hypnosis: { id: 'hypnosis', name: 'Hypnosis', type: 'shadow', power: 0, accuracy: 60, pp: 20, category: 'status', effect: 'sleep' },
  growl: { id: 'growl', name: 'Growl', type: 'stone', power: 0, accuracy: 100, pp: 20, category: 'status', effect: 'boost-atk', effectValue: -1, effectTarget: 'foe' },
  leer: { id: 'leer', name: 'Leer', type: 'stone', power: 0, accuracy: 100, pp: 20, category: 'status', effect: 'boost-def', effectValue: -1, effectTarget: 'foe' },
  poison_sting: { id: 'poison_sting', name: 'Poison Sting', type: 'leaf', power: 35, accuracy: 100, pp: 20, category: 'physical', effect: 'poison', effectChance: 30 },
};

export function getMove(id: string): MoveDef {
  return MOVES[id] ?? MOVES.tackle;
}
