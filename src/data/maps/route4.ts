import type { GameMap } from './types';
import { t } from './tiles';

export const route4: GameMap = {
  id: 'route4', name: 'Route 4', width: 24, height: 22,
  spawn: { x: 1, y: 10 }, encounterRate: 0.24, encounterTable: 'route4',
  warps: [
    { x: 0, y: 10, toMap: 'route3', toX: 22, toY: 8 },
    { x: 12, y: 0, toMap: 'glacier_pass', toX: 12, toY: 18 },
    { x: 22, y: 10, toMap: 'ember_city', toX: 1, toY: 10 },
  ],
  npcs: [
    { id: 'rival4', x: 12, y: 12, name: 'Kai', role: 'rival', lines: ['The cold won\'t slow me down!', 'Battle!'],
      trainer: { party: [{ creatureId: '__RIVAL_EVO2__', level: 20 }, { creatureId: 'frostkit', level: 19 }], reward: 550 } },
    { id: 'skier', x: 8, y: 6, name: 'Skier Pam', role: 'trainer_f', lines: ['Ice types thrive in the snow!', 'Let\'s go!'],
      trainer: { party: [{ creatureId: 'snowpuff', level: 19 }, { creatureId: 'frostmoss', level: 20 }], reward: 480 } },
    { id: 'sign10', x: 12, y: 16, name: 'Sign', role: 'sign', lines: ['Route 4', '← Route 3  |  ↑ Glacier Pass  |  → Ember City'] },
  ],
  tiles: t([
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T.............=.........T',
    'T.............=.........T',
    'T....####.....=.........T',
    'T....####.....=.........T',
    'T.............=.........T',
    'T.............=.........T',
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
};
