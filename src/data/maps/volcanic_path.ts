import type { GameMap } from './types';
import { t } from './tiles';

export const volcanic_path: GameMap = {
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
};
