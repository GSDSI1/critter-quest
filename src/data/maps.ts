/** 0=grass 1=path 2=tall-grass 3=water 4=tree 5=wall 6=floor 7=door 8=roof 9=heal-pad 10=sign 11=flower 12=rock 13=bridge 14=fence 15=sand 16=cave-floor 17=cave-wall 18=mart-counter */

import { rivalStarter, rivalEvolved } from './encounters';

export interface TrainerMon {
  creatureId: string;
  level: number;
}

export type NpcRole = 'generic' | 'nurse' | 'clerk' | 'trainer_m' | 'trainer_f' | 'rival' | 'leader' | 'prof' | 'sign';

export interface MapNpc {
  id: string;
  x: number;
  y: number;
  name: string;
  role?: NpcRole;
  lines: string[];
  trainer?: {
    party: TrainerMon[];
    reward: number;
    badge?: string;
  };
  rematch?: { party: TrainerMon[]; reward: number };
  gate?: { requiresBadge?: string; requiresFlag?: string; blockLines: string[] };
}

export type MapTheme = 'heal' | 'mart' | 'lab' | 'outdoor';

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[];
  spawn: { x: number; y: number };
  warps: { x: number; y: number; toMap: string; toX: number; toY: number; requiresBadge?: string }[];
  npcs: MapNpc[];
  encounterRate: number;
  encounterTable?: string;
  music?: string;
  mapTheme?: MapTheme;
}

function t(rows: string[]): number[] {
  const map: Record<string, number> = {
    '.': 0, '=': 1, '#': 2, '~': 3, 'T': 4, 'W': 5, 'F': 6,
    'D': 7, 'R': 8, 'H': 9, 'S': 10, '*': 11, 'O': 12, 'B': 13, '-': 14, ',': 15,
    'C': 16, 'K': 17, 'M': 18, 'G': 11,
  };
  return rows.join('').split('').map(c => map[c] ?? 0);
}

export const MAPS: Record<string, GameMap> = {
  town: {
    id: 'town', name: 'Verdant Town', width: 24, height: 18,
    spawn: { x: 12, y: 15 }, encounterRate: 0, encounterTable: 'route1',
    warps: [
      { x: 12, y: 0, toMap: 'route1', toX: 12, toY: 20 },
      { x: 8, y: 6, toMap: 'heal_center', toX: 4, toY: 7 },
      { x: 12, y: 6, toMap: 'mart', toX: 4, toY: 7 },
      { x: 16, y: 6, toMap: 'lab', toX: 4, toY: 7 },
    ],
    npcs: [
      { id: 'mom', x: 10, y: 10, name: 'Mom', role: 'generic', lines: ['Be careful out there!', 'Visit the Mart for supplies, and the Healing Center to rest.'] },
      { id: 'oldman', x: 4, y: 12, name: 'Old Timer', role: 'generic', lines: ['Press P for the menu. X for party. Z to talk.', 'Tall grass hides wild critters — walk in to find them!'] },
      { id: 'sign1', x: 12, y: 2, name: 'Sign', role: 'sign', lines: ['Verdant Town', '↑ Route 1  |  W: Healing Center  M: Mart  E: Lab'] },
    ],
    tiles: t([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T..================....T',
      'T..=..............=....T',
      'T..=....RRRRRR....=....T',
      'T..=....WHMHWR....=....T',
      'T..=..............=....T',
      'T..=..............=....T',
      'T..=..............=....T',
      'T..================....T',
      'T......................T',
      'T....*........*........T',
      'T......................T',
      'T........======........T',
      'T........======........T',
      'T......................T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ]),
  },

  heal_center: {
    id: 'heal_center', name: 'Healing Center', width: 9, height: 9,
    mapTheme: 'heal',
    spawn: { x: 4, y: 7 }, encounterRate: 0,
    warps: [{ x: 4, y: 8, toMap: 'town', toX: 8, toY: 7 }],
    npcs: [
      { id: 'nurse', x: 4, y: 3, name: 'Nurse Joy', role: 'nurse', lines: ['Welcome! Let me heal your critters!', 'HEAL'] },
      { id: 'pc', x: 7, y: 3, name: 'PC', role: 'generic', lines: ['Critter Storage System activated.', 'PC'] },
    ],
    tiles: t([
      'WWWWWWWWW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFHHFFFW',
      'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFDFFFW', 'WWWWWWWWW',
    ]),
  },

  mart: {
    id: 'mart', name: 'Verdant Mart', width: 9, height: 9,
    mapTheme: 'mart',
    spawn: { x: 4, y: 7 }, encounterRate: 0,
    warps: [{ x: 4, y: 8, toMap: 'town', toX: 12, toY: 7 }],
    npcs: [
      { id: 'clerk', x: 4, y: 3, name: 'Clerk', role: 'clerk', lines: ['Welcome to Verdant Mart!', 'SHOP'] },
    ],
    tiles: t([
      'WWWWWWWWW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFMMFFFW',
      'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFDFFFW', 'WWWWWWWWW',
    ]),
  },

  lab: {
    id: 'lab', name: 'Research Lab', width: 9, height: 9,
    mapTheme: 'lab',
    spawn: { x: 4, y: 7 }, encounterRate: 0,
    warps: [{ x: 4, y: 8, toMap: 'town', toX: 16, toY: 7 }],
    npcs: [
      { id: 'prof', x: 4, y: 3, name: 'Prof. Elmwood', role: 'prof', lines: [
        'Welcome, trainer! There are 27 critter species in this region.',
        'Check your Critterdex with P — catch them all!',
        'Defeat Gym Leader Ivy in Mossgrove for your first badge.',
      ] },
    ],
    tiles: t([
      'WWWWWWWWW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW',
      'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFDFFFW', 'WWWWWWWWW',
    ]),
  },

  route1: {
    id: 'route1', name: 'Route 1', width: 24, height: 22,
    spawn: { x: 12, y: 20 }, encounterRate: 0.18, encounterTable: 'route1',
    warps: [
      { x: 12, y: 21, toMap: 'town', toX: 12, toY: 1 },
      { x: 12, y: 0, toMap: 'forest', toX: 12, toY: 20 },
    ],
    npcs: [
      { id: 'rival', x: 12, y: 10, name: 'Kai', role: 'rival', lines: ['I\'ve been waiting! My critter is ready!', 'Let\'s battle!'],
        trainer: { party: [{ creatureId: '__RIVAL__', level: 6 }], reward: 300 } },
      { id: 'hiker', x: 6, y: 8, name: 'Hiker Dan', role: 'trainer_m', lines: ['Wild critters hide in the tall grass!', 'Use items from your Bag in battle — press Bag!'],
        trainer: { party: [{ creatureId: 'pebblite', level: 7 }, { creatureId: 'mossling', level: 8 }], reward: 200 },
        rematch: { party: [{ creatureId: 'rockord', level: 14 }, { creatureId: 'bloomoss', level: 15 }], reward: 350 } },
      { id: 'lass', x: 18, y: 14, name: 'Sarah', role: 'trainer_f', lines: ['My Bloomoss is so cute!', 'Battle me!'],
        trainer: { party: [{ creatureId: 'mossling', level: 8 }, { creatureId: 'leafkit', level: 9 }], reward: 180 } },
      { id: 'sign2', x: 12, y: 18, name: 'Sign', role: 'sign', lines: ['Route 1', '↑ Verdant Forest  |  ↓ Verdant Town'] },
    ],
    tiles: t([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T####............####..T',
      'T####............####..T',
      'T..=.............=.....T',
      'T..=....####.....=.....T',
      'T..=....####.....=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.....*.......=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=....####.....=.....T',
      'T..=....####.....=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.....S.......=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ]),
  },

  forest: {
    id: 'forest', name: 'Verdant Forest', width: 24, height: 22,
    spawn: { x: 12, y: 20 }, encounterRate: 0.22, encounterTable: 'forest',
    warps: [
      { x: 12, y: 21, toMap: 'route1', toX: 12, toY: 1 },
      { x: 23, y: 10, toMap: 'route2', toX: 1, toY: 10 },
    ],
    npcs: [
      { id: 'ranger', x: 16, y: 8, name: 'Ranger Mia', role: 'trainer_f', lines: ['Rare critters lurk here!', 'Head east to Mossgrove City when you\'re ready.'],
        trainer: { party: [{ creatureId: 'vineclaw', level: 11 }, { creatureId: 'shadeling', level: 12 }], reward: 350 } },
      { id: 'rival_forest', x: 12, y: 4, name: 'Kai', role: 'rival', lines: ['Not bad getting this far!', 'But you still can\'t beat me!'],
        trainer: { party: [{ creatureId: '__RIVAL_EVO__', level: 12 }, { creatureId: 'pebblite', level: 11 }], reward: 400 } },
      { id: 'bugcatcher', x: 8, y: 14, name: 'Ben', role: 'trainer_m', lines: ['Bug-type? We have leaf types!', 'En garde!'],
        trainer: { party: [{ creatureId: 'mossling', level: 10 }, { creatureId: 'bloomoss', level: 11 }], reward: 220 } },
      { id: 'sign3', x: 12, y: 19, name: 'Sign', lines: ['Verdant Forest', '↓ Route 1  |  → Route 2 / Mossgrove City'] },
    ],
    tiles: t([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T#######........#######T',
      'T#######........#######T',
      'T##.................=..T',
      'T##..OOOO...........=..T',
      'T##.................=..T',
      'T....####...####....=..T',
      'T....####...####....=..T',
      'T...................=..T',
      'T....*........*.....=..T',
      'T...................=..T',
      'T..####.......####..=..T',
      'T..####.......####..=..T',
      'T...................=..T',
      'T.......======......=..T',
      'T.......======......=..T',
      'T...................=..T',
      'T.............S.....=..T',
      'T...................=..T',
      'T...................=..T',
      'T...................=..T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ]),
  },

  route2: {
    id: 'route2', name: 'Route 2', width: 24, height: 22,
    spawn: { x: 1, y: 10 }, encounterRate: 0.2, encounterTable: 'route2',
    warps: [
      { x: 0, y: 10, toMap: 'forest', toX: 22, toY: 10 },
      { x: 12, y: 0, toMap: 'mossgrove', toX: 12, toY: 17 },
    ],
    npcs: [
      { id: 'gatekeeper', x: 12, y: 5, name: 'Guard', lines: ['Mossgrove City ahead!'],
        gate: { requiresFlag: 'defeated_ranger', blockLines: ['Halt! Defeat Ranger Mia in the forest first.', 'She\'ll vouch for new trainers.'] } },
      { id: 'youngster', x: 8, y: 12, name: 'Joey', lines: ['My Pebblite is the strongest!', 'Fight me!'],
        trainer: { party: [{ creatureId: 'pebblite', level: 11 }, { creatureId: 'rockord', level: 12 }], reward: 280 } },
      { id: 'sign4', x: 12, y: 15, name: 'Sign', lines: ['Route 2', '↑ Mossgrove City  |  ← Verdant Forest'] },
    ],
    tiles: t([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.............=.........T',
      'T.............=.........T',
      'T.............=.........T',
      'T.............=.........T',
      'T....####.....=.........T',
      'T....####.....=.........T',
      'T.............=.........T',
      'T.............=.........T',
      'T.............=.........T',
      '=.............=.........=',
      'T.............=.........T',
      'T.............=.........T',
      'T..####.......=.........T',
      'T..####.......=.........T',
      'T.............S.........T',
      'T.............=.........T',
      'T.............=.........T',
      'T.............=.........T',
      'T.............=.........T',
      'T.............=.........T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ]),
  },

  mossgrove: {
    id: 'mossgrove', name: 'Mossgrove City', width: 24, height: 20,
    spawn: { x: 12, y: 16 }, encounterRate: 0, encounterTable: 'route2',
    warps: [
      { x: 12, y: 18, toMap: 'route2', toX: 12, toY: 1 },
      { x: 8, y: 6, toMap: 'heal_center', toX: 4, toY: 7 },
      { x: 12, y: 6, toMap: 'mart', toX: 4, toY: 7 },
      { x: 16, y: 6, toMap: 'gym1', toX: 6, toY: 11 },
      { x: 12, y: 0, toMap: 'route3', toX: 12, toY: 18, requiresBadge: 'verdant' },
    ],
    npcs: [
      { id: 'guide', x: 12, y: 12, name: 'City Guide', lines: ['Welcome to Mossgrove!', 'The Gym is east — Leader Ivy uses Leaf types.', 'The cave north opens after you earn the Verdant Badge.'] },
      { id: 'cooltrainer', x: 18, y: 10, name: 'Alex', lines: ['Think you\'re ready for the Gym?', 'Prove it!'],
        trainer: { party: [{ creatureId: 'sparkbit', level: 13 }, { creatureId: 'voltwing', level: 14 }], reward: 400 } },
      { id: 'sign5', x: 12, y: 14, name: 'Sign', lines: ['Mossgrove City', 'Gym →  |  ↑ Crystal Cave (badge required)'] },
    ],
    tiles: t([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T..........====........T',
      'T..........====........T',
      'T......................T',
      'T..================....T',
      'T..=..............=....T',
      'T..=....WHGRRR....=....T',
      'T..=..............=....T',
      'T..=..............=....T',
      'T..=..............=....T',
      'T..================....T',
      'T......................T',
      'T....*........*........T',
      'T......................T',
      'T........S.............T',
      'T......................T',
      'T........======........T',
      'T........======........T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ]),
  },

  gym1: {
    id: 'gym1', name: 'Mossgrove Gym', width: 14, height: 14,
    spawn: { x: 6, y: 11 }, encounterRate: 0,
    warps: [{ x: 6, y: 13, toMap: 'mossgrove', toX: 16, toY: 7 }],
    npcs: [
      { id: 'gym_trainer1', x: 4, y: 7, name: 'Gym Trainer Lee', lines: ['Leader Ivy is tough!', 'You\'ll face me first!'],
        trainer: { party: [{ creatureId: 'mossling', level: 13 }, { creatureId: 'bloomoss', level: 14 }], reward: 350 } },
      { id: 'gym_trainer2', x: 9, y: 5, name: 'Gym Trainer Ana', lines: ['Leaf types absorb your attacks!', 'Good luck!'],
        trainer: { party: [{ creatureId: 'vineclaw', level: 15 }, { creatureId: 'leafkit', level: 14 }], reward: 380 } },
      { id: 'gym_leader', x: 6, y: 3, name: 'Gym Leader Ivy', lines: [
        'Welcome to Mossgrove Gym!', 'I cultivate the strongest Leaf critters.', 'Show me your bond with your partners!',
      ], trainer: {
        party: [
          { creatureId: 'bloomoss', level: 16 },
          { creatureId: 'vineclaw', level: 17 },
          { creatureId: 'thornbeast', level: 18 },
        ],
        reward: 800,
        badge: 'verdant',
      } },
    ],
    tiles: t([
      'WWWWWWWWWWWWWW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFFFFFFFFW',
      'WFFFFFFFDFFFFFFW',
      'WWWWWWWWWWWWWW',
    ]),
  },

  crystal_cave: {
    id: 'crystal_cave', name: 'Crystal Cave', width: 24, height: 20,
    spawn: { x: 12, y: 18 }, encounterRate: 0.28, encounterTable: 'crystal_cave',
    warps: [{ x: 12, y: 19, toMap: 'mossgrove', toX: 12, toY: 1 }],
    npcs: [
      { id: 'hiker2', x: 8, y: 8, name: 'Cave Hiker', lines: ['Crystalynx lives deep in here!', 'Watch out — strong wild critters!'],
        trainer: { party: [{ creatureId: 'rockord', level: 16 }, { creatureId: 'crystalynx', level: 17 }], reward: 500 } },
      { id: 'sign6', x: 12, y: 16, name: 'Sign', lines: ['Crystal Cave', 'Rare critters ahead. ↓ Mossgrove City'] },
    ],
    tiles: t([
      'KKKKKKKKKKKKKKKKKKKKKKKK',
      'KCC..............CC....K',
      'KCC..OOOO........CC....K',
      'KCC..............CC....K',
      'KCC....####......CC....K',
      'KCC....####......CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC......**......CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC....####......CC....K',
      'KCC....####......CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC......S.......CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KKKKKKKKKKKKKKKKKKKKKKKK',
    ]),
  },

  route3: {
    id: 'route3', name: 'Route 3', width: 24, height: 22,
    spawn: { x: 12, y: 18 }, encounterRate: 0.22, encounterTable: 'route3',
    warps: [
      { x: 12, y: 19, toMap: 'mossgrove', toX: 12, toY: 1 },
      { x: 12, y: 0, toMap: 'ember_city', toX: 12, toY: 17 },
    ],
    npcs: [
      { id: 'rival2', x: 12, y: 8, name: 'Kai', role: 'rival', lines: ['You again?! My team got stronger!', 'Prepare to lose!'],
        trainer: { party: [{ creatureId: '__RIVAL_EVO__', level: 12 }, { creatureId: 'sparkbit', level: 11 }], reward: 450 } },
      { id: 'sign7', x: 12, y: 16, name: 'Sign', role: 'sign', lines: ['Route 3', '↑ Ember City  |  ↓ Mossgrove City'] },
    ],
    tiles: t([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T####............####..T',
      'T####............####..T',
      'T..=.............=.....T',
      'T..=....####.....=.....T',
      'T..=....####.....=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.....*.......=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=....####.....=.....T',
      'T..=....####.....=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.....S.......=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'T..=.............=.....T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ]),
  },

  ember_city: {
    id: 'ember_city', name: 'Ember City', width: 24, height: 20,
    spawn: { x: 12, y: 16 }, encounterRate: 0,
    warps: [
      { x: 12, y: 18, toMap: 'route3', toX: 12, toY: 1 },
      { x: 8, y: 6, toMap: 'heal_center', toX: 4, toY: 7 },
      { x: 12, y: 6, toMap: 'mart', toX: 4, toY: 7 },
      { x: 16, y: 6, toMap: 'gym2', toX: 6, toY: 11 },
      { x: 12, y: 0, toMap: 'volcanic_path', toX: 12, toY: 18, requiresBadge: 'ember' },
    ],
    npcs: [
      { id: 'guide2', x: 12, y: 12, name: 'City Guide', role: 'generic', lines: ['Welcome to Ember City!', 'Gym Leader Cole awaits challengers to the east.', 'Volcanic Path opens after the Ember Badge.'] },
      { id: 'sign8', x: 12, y: 14, name: 'Sign', role: 'sign', lines: ['Ember City', 'Gym →  |  ↑ Volcanic Path (badge required)'] },
    ],
    tiles: t([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T..........====........T',
      'T..........====........T',
      'T......................T',
      'T..================....T',
      'T..=..............=....T',
      'T..=....WHGRRR....=....T',
      'T..=..............=....T',
      'T..=..............=....T',
      'T..=..............=....T',
      'T..================....T',
      'T......................T',
      'T....*........*........T',
      'T......................T',
      'T........S.............T',
      'T......................T',
      'T........======........T',
      'T........======........T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ]),
  },

  gym2: {
    id: 'gym2', name: 'Ember City Gym', width: 14, height: 14,
    spawn: { x: 6, y: 11 }, encounterRate: 0,
    warps: [{ x: 6, y: 13, toMap: 'ember_city', toX: 16, toY: 7 }],
    npcs: [
      { id: 'gym2_trainer1', x: 4, y: 7, name: 'Gym Trainer Rex', role: 'trainer_m', lines: ['Flame types burn bright here!', 'You\'ll face me first!'],
        trainer: { party: [{ creatureId: 'cinderkit', level: 17 }, { creatureId: 'emberpup', level: 18 }], reward: 400 } },
      { id: 'gym2_trainer2', x: 9, y: 5, name: 'Gym Trainer Fay', role: 'trainer_f', lines: ['Cole is the strongest trainer in Ember City!', 'Good luck!'],
        trainer: { party: [{ creatureId: 'flamewyrm', level: 19 }, { creatureId: 'voltite', level: 18 }], reward: 420 } },
      { id: 'gym_leader_cole', x: 6, y: 3, name: 'Gym Leader Cole', role: 'leader', lines: [
        'Welcome to Ember City Gym!', 'I forge the hottest flame critters.', 'Show me your fighting spirit!',
      ], trainer: {
        party: [
          { creatureId: 'cinderkit', level: 20 },
          { creatureId: 'flamewyrm', level: 21 },
          { creatureId: 'emberlord', level: 22 },
        ],
        reward: 1000,
        badge: 'ember',
      } },
    ],
    tiles: t([
      'WWWWWWWWWWWWWW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFGFFFFFFW',
      'WFFFFFFFFFFFFFW',
      'WFFFFFFFDFFFFFFW',
      'WWWWWWWWWWWWWW',
    ]),
  },

  volcanic_path: {
    id: 'volcanic_path', name: 'Volcanic Path', width: 24, height: 20,
    spawn: { x: 12, y: 18 }, encounterRate: 0.26, encounterTable: 'volcanic_path',
    warps: [
      { x: 12, y: 19, toMap: 'ember_city', toX: 12, toY: 1 },
      { x: 12, y: 0, toMap: 'crystal_cave', toX: 12, toY: 18 },
    ],
    npcs: [
      { id: 'rival3', x: 10, y: 6, name: 'Kai', role: 'rival', lines: ['This is it — our final showdown before the League!', 'I won\'t hold back!'],
        trainer: { party: [{ creatureId: '__RIVAL_EVO2__', level: 18 }, { creatureId: 'flamewyrm', level: 17 }, { creatureId: 'voltwing', level: 16 }], reward: 700 } },
      { id: 'volcano_hiker', x: 16, y: 10, name: 'Volcano Hiker', role: 'trainer_m', lines: ['Grimlets lurk in the lava rocks!', 'Battle me!'],
        trainer: { party: [{ creatureId: 'grimlet', level: 20 }, { creatureId: 'rockord', level: 19 }], reward: 550 } },
      { id: 'sign9', x: 12, y: 16, name: 'Sign', role: 'sign', lines: ['Volcanic Path', '↑ Crystal Cave  |  ↓ Ember City'] },
    ],
    tiles: t([
      'KKKKKKKKKKKKKKKKKKKKKKKK',
      'KCC..............CC....K',
      'KCC..OOOO........CC....K',
      'KCC..............CC....K',
      'KCC....####......CC....K',
      'KCC....####......CC....K',
      'KCC..............CC....K',
      'KCC......**......CC....K',
      'KCC..............CC....K',
      'KCC....####......CC....K',
      'KCC....####......CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC......S.......CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KCC..............CC....K',
      'KKKKKKKKKKKKKKKKKKKKKKKK',
    ]),
  },
};

export function getMap(id: string): GameMap {
  return MAPS[id] ?? MAPS.town;
}

export function isWalkable(tile: number): boolean {
  return [0, 1, 2, 6, 7, 9, 11, 13, 15, 16, 18].includes(tile);
}

export function isEncounterTile(tile: number): boolean {
  return tile === 2;
}

export function isWarpTile(map: GameMap, x: number, y: number) {
  return map.warps.find(w => w.x === x && w.y === y);
}

export function getTile(map: GameMap, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return 4;
  return map.tiles[y * map.width + x] ?? 4;
}

export function resolveTrainerParty(party: TrainerMon[], playerStarter: string): TrainerMon[] {
  return party.map(m => {
    let creatureId = m.creatureId;
    if (creatureId === '__RIVAL__') creatureId = rivalStarter(playerStarter);
    else if (creatureId === '__RIVAL_EVO__') creatureId = rivalEvolved(playerStarter, 1);
    else if (creatureId === '__RIVAL_EVO2__') creatureId = rivalEvolved(playerStarter, 2);
    return { creatureId, level: m.level };
  });
}
