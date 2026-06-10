import type { GameMap } from './types';
import { t } from './tiles';

export const ember_city: GameMap = {
  id: 'ember_city', name: 'Ember City', width: 24, height: 20,
  spawn: { x: 12, y: 16 }, encounterRate: 0,
  warps: [
    { x: 12, y: 18, toMap: 'route3', toX: 12, toY: 1 },
    { x: 1, y: 10, toMap: 'route4', toX: 22, toY: 10, requiresBadge: 'ember' },
    { x: 8, y: 6, toMap: 'heal_center', toX: 4, toY: 7 },
    { x: 12, y: 6, toMap: 'mart', toX: 4, toY: 7 },
    { x: 16, y: 6, toMap: 'gym2', toX: 6, toY: 11 },
    { x: 12, y: 0, toMap: 'volcanic_path', toX: 12, toY: 18, requiresBadge: 'ember' },
  ],
  npcs: [
    { id: 'guide2', x: 12, y: 12, name: 'City Guide', role: 'generic', lines: ['Welcome to Ember City!', 'Gym Leader Cole awaits challengers to the east.', 'Route 4 east opens after the Ember Badge.', 'Volcanic Path opens after the Ember Badge.'] },
    { id: 'sign8', x: 12, y: 14, name: 'Sign', role: 'sign', lines: ['Ember City', 'Gym →  |  → Route 4 (badge)  |  ↑ Volcanic Path (badge)'] },
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
