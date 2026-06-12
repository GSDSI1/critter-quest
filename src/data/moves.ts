import type { ElementType } from './types';

export interface MoveDef {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  accuracy: number;
  pp: number;
  category: 'physical' | 'special' | 'status';
  effect?: 'heal' | 'sleep' | 'boost-atk' | 'boost-def' | 'boost-spa' | 'boost-spd' | 'boost-spe'
    | 'burn' | 'paralyze' | 'poison' | 'thunderwave' | 'hypnosis' | 'confusion' | 'freeze' | 'flinch';
  effectChance?: number;
  effectValue?: number;
  /** Who receives stat-stage changes from boost-* moves. Defaults to 'foe'. */
  effectTarget?: 'self' | 'foe';
  /** Turn-order bracket; higher acts first regardless of speed. Default 0. */
  priority?: number;
  /** Attacker takes this % of dealt damage as recoil (blocked by Rock Head). */
  recoilPct?: number;
  /** Attacker heals this % of dealt damage. */
  drainPct?: number;
  /** Hits [min, max] times per use. */
  multiHit?: [number, number];
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
  icebeam: { id: 'icebeam', name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, pp: 10, category: 'special', effect: 'freeze', effectChance: 10 },
  frostbite: { id: 'frostbite', name: 'Frost Bite', type: 'ice', power: 55, accuracy: 100, pp: 25, category: 'special', effect: 'freeze', effectChance: 10 },
  iceshard: { id: 'iceshard', name: 'Ice Shard', type: 'ice', power: 40, accuracy: 100, pp: 30, category: 'physical', priority: 1 },
  blizzard: { id: 'blizzard', name: 'Blizzard', type: 'ice', power: 100, accuracy: 85, pp: 5, category: 'special', effect: 'freeze', effectChance: 10 },
  psybeam: { id: 'psybeam', name: 'Psybeam', type: 'psychic', power: 65, accuracy: 100, pp: 20, category: 'special' },
  mindblast: { id: 'mindblast', name: 'Mind Blast', type: 'psychic', power: 90, accuracy: 95, pp: 10, category: 'special' },
  calm_mind: { id: 'calm_mind', name: 'Calm Mind', type: 'psychic', power: 0, accuracy: 100, pp: 20, category: 'status', effect: 'boost-spa', effectValue: 1, effectTarget: 'self' },
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
  coalsurge: { id: 'coalsurge', name: 'Coal Surge', type: 'flame', power: 65, accuracy: 95, pp: 15, category: 'special', effect: 'burn', effectChance: 20 },
  reef_surge: { id: 'reef_surge', name: 'Reef Surge', type: 'tide', power: 75, accuracy: 95, pp: 12, category: 'special' },
  shadow_dust: { id: 'shadow_dust', name: 'Shadow Dust', type: 'shadow', power: 55, accuracy: 100, pp: 20, category: 'special', effect: 'sleep', effectChance: 15 },
  volt_ram: { id: 'volt_ram', name: 'Volt Ram', type: 'volt', power: 75, accuracy: 90, pp: 12, category: 'physical', effect: 'paralyze', effectChance: 20 },
  magma_crush: { id: 'magma_crush', name: 'Magma Crush', type: 'flame', power: 80, accuracy: 90, pp: 10, category: 'physical', effect: 'burn', effectChance: 15 },
  murk_fang: { id: 'murk_fang', name: 'Murk Fang', type: 'shadow', power: 65, accuracy: 95, pp: 15, category: 'physical', effect: 'sleep', effectChance: 12 },
  frost_shatter: { id: 'frost_shatter', name: 'Frost Shatter', type: 'ice', power: 70, accuracy: 100, pp: 15, category: 'special', effect: 'freeze', effectChance: 10 },
  psy_burst: { id: 'psy_burst', name: 'Psy Burst', type: 'psychic', power: 75, accuracy: 95, pp: 12, category: 'special' },
  gale_dash: { id: 'gale_dash', name: 'Gale Dash', type: 'volt', power: 70, accuracy: 100, pp: 15, category: 'special', effect: 'paralyze', effectChance: 10 },
  glacier_fang: { id: 'glacier_fang', name: 'Glacier Fang', type: 'ice', power: 80, accuracy: 90, pp: 12, category: 'physical', effect: 'freeze', effectChance: 10 },
  night_stalk: { id: 'night_stalk', name: 'Night Stalk', type: 'shadow', power: 75, accuracy: 95, pp: 12, category: 'physical' },
  prism_beam: { id: 'prism_beam', name: 'Prism Beam', type: 'psychic', power: 70, accuracy: 100, pp: 15, category: 'special' },
  brine_splash: { id: 'brine_splash', name: 'Brine Splash', type: 'tide', power: 55, accuracy: 100, pp: 20, category: 'physical' },
  thorn_lash: { id: 'thorn_lash', name: 'Thorn Lash', type: 'leaf', power: 65, accuracy: 95, pp: 15, category: 'physical', effect: 'poison', effectChance: 15 },
  tidal_maul: { id: 'tidal_maul', name: 'Tidal Maul', type: 'tide', power: 85, accuracy: 90, pp: 10, category: 'physical' },
  rose_strike: { id: 'rose_strike', name: 'Rose Strike', type: 'leaf', power: 80, accuracy: 95, pp: 12, category: 'physical', effect: 'poison', effectChance: 20 },
  crystal_lance: { id: 'crystal_lance', name: 'Crystal Lance', type: 'psychic', power: 90, accuracy: 90, pp: 8, category: 'special' },
  cinder_swipe: { id: 'cinder_swipe', name: 'Cinder Swipe', type: 'flame', power: 50, accuracy: 100, pp: 20, category: 'physical', effect: 'burn', effectChance: 15 },
  static_peck: { id: 'static_peck', name: 'Static Peck', type: 'volt', power: 45, accuracy: 100, pp: 25, category: 'physical', effect: 'paralyze', effectChance: 15 },
  thunder_dive: { id: 'thunder_dive', name: 'Thunder Dive', type: 'volt', power: 90, accuracy: 90, pp: 10, category: 'special', effect: 'paralyze', effectChance: 20 },
  ash_roar: { id: 'ash_roar', name: 'Ash Roar', type: 'flame', power: 65, accuracy: 95, pp: 15, category: 'special', effect: 'burn', effectChance: 25 },
  scorch_claw: { id: 'scorch_claw', name: 'Scorch Claw', type: 'flame', power: 85, accuracy: 90, pp: 12, category: 'physical', effect: 'burn', effectChance: 15 },
  gleam_pulse: { id: 'gleam_pulse', name: 'Gleam Pulse', type: 'psychic', power: 75, accuracy: 100, pp: 15, category: 'special' },
  storm_beak: { id: 'storm_beak', name: 'Storm Beak', type: 'volt', power: 95, accuracy: 85, pp: 8, category: 'physical', effect: 'paralyze', effectChance: 25 },
  confuse_ray: { id: 'confuse_ray', name: 'Confuse Ray', type: 'shadow', power: 0, accuracy: 100, pp: 12, category: 'status', effect: 'confusion' },
  supersonic: { id: 'supersonic', name: 'Supersonic', type: 'psychic', power: 0, accuracy: 60, pp: 20, category: 'status', effect: 'confusion' },
  quick_strike: { id: 'quick_strike', name: 'Quick Strike', type: 'stone', power: 40, accuracy: 100, pp: 30, category: 'physical', priority: 1 },
  shadow_sneak: { id: 'shadow_sneak', name: 'Shadow Sneak', type: 'shadow', power: 40, accuracy: 100, pp: 30, category: 'physical', priority: 1 },
  double_kick: { id: 'double_kick', name: 'Double Kick', type: 'stone', power: 30, accuracy: 100, pp: 25, category: 'physical', multiHit: [2, 2] },
  pin_barrage: { id: 'pin_barrage', name: 'Pin Barrage', type: 'leaf', power: 18, accuracy: 95, pp: 20, category: 'physical', multiHit: [2, 5] },
  take_down: { id: 'take_down', name: 'Take Down', type: 'stone', power: 85, accuracy: 90, pp: 15, category: 'physical', recoilPct: 25 },
  flare_blitz: { id: 'flare_blitz', name: 'Flare Blitz', type: 'flame', power: 110, accuracy: 95, pp: 8, category: 'physical', recoilPct: 33, effect: 'burn', effectChance: 10 },
  absorb: { id: 'absorb', name: 'Absorb', type: 'leaf', power: 40, accuracy: 100, pp: 25, category: 'special', drainPct: 50 },
  leech_life: { id: 'leech_life', name: 'Leech Life', type: 'leaf', power: 70, accuracy: 100, pp: 12, category: 'physical', drainPct: 50 },
  agility: { id: 'agility', name: 'Agility', type: 'psychic', power: 0, accuracy: 100, pp: 20, category: 'status', effect: 'boost-spe', effectValue: 2, effectTarget: 'self' },
  icy_gale: { id: 'icy_gale', name: 'Icy Gale', type: 'ice', power: 55, accuracy: 95, pp: 20, category: 'special', effect: 'freeze', effectChance: 10 },
  bite: { id: 'bite', name: 'Bite', type: 'shadow', power: 60, accuracy: 100, pp: 25, category: 'physical', effect: 'flinch', effectChance: 30 },
  headbutt: { id: 'headbutt', name: 'Headbutt', type: 'stone', power: 70, accuracy: 100, pp: 15, category: 'physical', effect: 'flinch', effectChance: 30 },
};

export function getMove(id: string): MoveDef {
  return MOVES[id] ?? MOVES.tackle;
}
