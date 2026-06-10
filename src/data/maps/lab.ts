import type { GameMap } from './types';
import { t } from './tiles';

export const lab: GameMap = {
  id: 'lab', name: 'Research Lab', width: 9, height: 9,
  mapTheme: 'lab',
  spawn: { x: 4, y: 7 }, encounterRate: 0,
  warps: [{ x: 4, y: 8, toMap: 'town', toX: 16, toY: 7 }],
  npcs: [
    { id: 'prof', x: 4, y: 3, name: 'Prof. Elmwood', role: 'prof', lines: [
      'Welcome, trainer! There are 27 critter species in this region.',
      'Check your Critterdex with P — catch them all!',
      'Defeat Gym Leader Ivy in Mossgrove for your first badge.',
    ] },
  ],
  tiles: t([
    'WWWWWWWWW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW',
    'WFFFFFFFW', 'WFFFFFFFW', 'WFFFFFFFW', 'WFFFDFFFW', 'WWWWWWWWW',
  ]),
};
