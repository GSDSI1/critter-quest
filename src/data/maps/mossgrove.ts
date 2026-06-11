import type { GameMap } from './types';
import { t } from './tiles';

export const mossgrove: GameMap = {
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
    { id: 'chest_moss', x: 4, y: 10, name: 'Chest', role: 'chest', lines: ['CHEST', 'chest_moss'] },
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
};
