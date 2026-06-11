import type { GameMap } from './types';
import { t } from './tiles';

export const contest_hall: GameMap = {
  id: 'contest_hall', name: 'Contest Hall', width: 14, height: 12,
  mapTheme: 'mart',
  spawn: { x: 7, y: 10 }, encounterRate: 0,
  warps: [{ x: 7, y: 11, toMap: 'frostvale', toX: 14, toY: 8 }],
  npcs: [
    { id: 'contest_host', x: 7, y: 4, name: 'Host Vera', role: 'generic', lines: [
      'Welcome to the Frostvale Critter Contest!',
      'Show off your partner\'s beauty and strength. CONTEST',
    ] },
    { id: 'sign_contest', x: 2, y: 2, name: 'Sign', role: 'sign', lines: ['Critter Contest Hall', 'One entry per day — prizes await!'] },
  ],
  tiles: t([
    'WWWWWWWWWWWWWW',
    'W............W',
    'W............W',
    'W....FFFF....W',
    'W....FFFF....W',
    'W............W',
    'W............W',
    'W............W',
    'W............W',
    'W............W',
    'W.....D......W',
    'WWWWWWWWWWWWWW',
  ]),
};
