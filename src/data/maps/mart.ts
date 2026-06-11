import type { GameMap } from './types';
import { t } from './tiles';

export const mart: GameMap = {
  id: 'mart', name: 'Verdant Mart', width: 9, height: 9,
  mapTheme: 'mart',
  spawn: { x: 4, y: 7 }, encounterRate: 0,
  warps: [{ x: 4, y: 8, toMap: 'town', toX: 12, toY: 7 }],
  npcs: [
    { id: 'clerk', x: 4, y: 3, name: 'Clerk', role: 'clerk', lines: ['Welcome to Verdant Mart!', 'SHOP'] },
  ],
  tiles: t([
    'WWWWWWWWW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFMMFFFW',
    'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFDFFFW', 'WWWWDWWWW',
  ]),
};
