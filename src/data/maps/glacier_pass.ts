import type { GameMap } from './types';
import { t } from './tiles';

export const glacier_pass: GameMap = {
  id: 'glacier_pass', name: 'Glacier Pass', width: 24, height: 22,
  spawn: { x: 12, y: 18 }, encounterRate: 0.26, encounterTable: 'glacier_pass',
  warps: [
    { x: 12, y: 19, toMap: 'route4', toX: 12, toY: 1 },
    { x: 12, y: 0, toMap: 'frostvale', toX: 12, toY: 17 },
  ],
  npcs: [
    { id: 'mountaineer', x: 6, y: 8, name: 'Mountaineer Ben', role: 'trainer_m', lines: ['Blizzards hide fierce critters!', 'Ready?'],
      trainer: { party: [{ creatureId: 'glacetail', level: 22 }, { creatureId: 'frosthorn', level: 23 }], reward: 580 } },
    { id: 'ice_climber', x: 17, y: 10, name: 'Climber Eva', role: 'trainer_f', lines: ['My team adapted to the freeze!', 'Fight me!'],
      trainer: { party: [{ creatureId: 'blizzhound', level: 23 }, { creatureId: 'chillbite', level: 24 }], reward: 600 } },
    { id: 'sign11', x: 12, y: 16, name: 'Sign', role: 'sign', lines: ['Glacier Pass', '↓ Route 4  |  ↑ Frostvale City'] },
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
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KKKKKKKKKKKKKKKKKKKKKKKK',
  ]),
};
