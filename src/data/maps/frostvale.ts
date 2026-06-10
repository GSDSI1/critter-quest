import type { GameMap } from './types';
import { t } from './tiles';

export const frostvale: GameMap = {
  id: 'frostvale', name: 'Frostvale City', width: 24, height: 20,
  spawn: { x: 12, y: 16 }, encounterRate: 0,
  warps: [
    { x: 12, y: 18, toMap: 'glacier_pass', toX: 12, toY: 1 },
    { x: 8, y: 6, toMap: 'heal_center', toX: 4, toY: 7 },
    { x: 12, y: 6, toMap: 'mart', toX: 4, toY: 7 },
    { x: 16, y: 6, toMap: 'gym3', toX: 6, toY: 11 },
    { x: 12, y: 0, toMap: 'route5', toX: 12, toY: 18, requiresBadge: 'frost' },
  ],
  npcs: [
    { id: 'guide3', x: 12, y: 12, name: 'City Guide', role: 'generic', lines: ['Welcome to Frostvale!', 'Gym Leader Glacier awaits to the east.', 'Route 5 opens after the Frost Badge.'] },
    { id: 'cooltrainer2', x: 18, y: 10, name: 'Jordan', role: 'trainer_m', lines: ['Think you can handle the cold?', 'Prove it!'],
      trainer: { party: [{ creatureId: 'aurorabit', level: 22 }, { creatureId: 'arctodon', level: 23 }], reward: 520 } },
    { id: 'sign12', x: 12, y: 14, name: 'Sign', role: 'sign', lines: ['Frostvale City', 'Gym →  |  ↑ Route 5 (badge required)'] },
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
