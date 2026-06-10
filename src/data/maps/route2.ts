import type { GameMap } from './types';
import { t } from './tiles';

export const route2: GameMap = {
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
};
