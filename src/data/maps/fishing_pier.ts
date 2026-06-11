import type { GameMap } from './types';
import { t } from './tiles';

export const fishing_pier: GameMap = {
  id: 'fishing_pier', name: 'Fishing Pier', width: 12, height: 10,
  mapTheme: 'mart',
  spawn: { x: 6, y: 8 }, encounterRate: 0,
  warps: [{ x: 6, y: 9, toMap: 'route3', toX: 8, toY: 11 }],
  npcs: [
    { id: 'fisher_rod', x: 6, y: 4, name: 'Old Fisher', role: 'generic', lines: [
      'Cast a line and feel the tide pull!',
      'Take this rod — the pier is yours. FISH',
    ] },
    { id: 'sign_pier', x: 2, y: 2, name: 'Sign', role: 'sign', lines: ['Route 3 Fishing Pier', 'Tap Talk near the fisher to cast!'] },
  ],
  tiles: t([
    'WWWWWWWWWWWW',
    'W..........W',
    'W....HH....W',
    'W..........W',
    'W..........W',
    'W....~~~...W',
    'W....~~~...W',
    'W..........W',
    'W....D.....W',
    'WWWWWWDWWWWW',
  ]),
};
