import type { GameMap } from './types';
import { t } from './tiles';

export const crystal_cave: GameMap = {
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
};
