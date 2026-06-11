import type { GameMap } from './types';
import { t } from './tiles';

export const route3: GameMap = {
  id: 'route3', name: 'Route 3', width: 24, height: 22,
  spawn: { x: 12, y: 18 }, encounterRate: 0.22, encounterTable: 'route3',
  warps: [
    { x: 12, y: 19, toMap: 'mossgrove', toX: 12, toY: 1 },
    { x: 12, y: 0, toMap: 'ember_city', toX: 12, toY: 17 },
    { x: 22, y: 8, toMap: 'route4', toX: 0, toY: 10 },
  ],
  npcs: [
    { id: 'rival2', x: 12, y: 8, name: 'Kai', role: 'rival', lines: ['You again?! My team got stronger!', 'Prepare to lose!'],
      trainer: { party: [{ creatureId: '__RIVAL_EVO__', level: 12 }, { creatureId: 'sparkbit', level: 11 }], reward: 450 } },
    { id: 'swimmer_mia', x: 4, y: 12, name: 'Mia', role: 'trainer_f', lines: ['Kelplings play in the tide pools here!', 'Want to swim with them?'],
      trainer: { party: [{ creatureId: 'brinepup', level: 13 }, { creatureId: 'kelpling', level: 14 }], reward: 440 } },
    { id: 'sign7', x: 12, y: 16, name: 'Sign', role: 'sign', lines: ['Route 3', '↑ Ember City  |  → Route 4  |  ↓ Mossgrove City'] },
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
    'T..=....~~~......=.....T',
    'T..=....~~~......=.....T',
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
    'TTTTTTTTTTTTTTTTTTTTTTTT',
  ]),
};
