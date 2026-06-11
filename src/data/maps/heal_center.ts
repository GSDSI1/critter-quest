import type { GameMap } from './types';
import { t } from './tiles';

export const heal_center: GameMap = {
  id: 'heal_center', name: 'Healing Center', width: 9, height: 9,
  mapTheme: 'heal',
  spawn: { x: 4, y: 7 }, encounterRate: 0,
  warps: [{ x: 4, y: 8, toMap: 'town', toX: 8, toY: 7 }],
  npcs: [
    { id: 'nurse', x: 4, y: 3, name: 'Nurse Joy', role: 'nurse', lines: ['Welcome! Let me heal your critters!', 'HEAL'] },
    { id: 'pc', x: 7, y: 3, name: 'PC', role: 'generic', lines: ['Critter Storage System activated.', 'PC'] },
  ],
  tiles: t([
    'WWWWWWWWW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFHHFFFW',
    'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFDFFFW', 'WWWWDWWWW',
  ]),
};
