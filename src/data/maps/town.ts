import type { GameMap } from './types';
import { t } from './tiles';

export const town: GameMap = {
  id: 'town', name: 'Verdant Town', width: 24, height: 18,
  spawn: { x: 12, y: 15 }, encounterRate: 0, encounterTable: 'route1',
  warps: [
    { x: 12, y: 0, toMap: 'route1', toX: 12, toY: 20 },
    { x: 8, y: 6, toMap: 'heal_center', toX: 4, toY: 7 },
    { x: 12, y: 6, toMap: 'mart', toX: 4, toY: 7 },
    { x: 16, y: 6, toMap: 'lab', toX: 4, toY: 7 },
  ],
  npcs: [
    { id: 'mom', x: 10, y: 10, name: 'Mom', role: 'generic', lines: ['Be careful out there!', 'Visit the Mart for supplies, and the Healing Center to rest.'] },
    { id: 'oldman', x: 4, y: 12, name: 'Old Timer', role: 'generic', lines: ['Press P for the menu. X for party. Z to talk.', 'Tall grass hides wild critters — walk in to find them!'] },
    { id: 'sign1', x: 12, y: 2, name: 'Sign', role: 'sign', lines: ['Verdant Town', '↑ Route 1  |  W: Healing Center  M: Mart  E: Lab'] },
  ],
  tiles: t([
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................T',
    'T..================....T',
    'T..=..............=....T',
    'T..=....RRRRRR....=....T',
    'T..=....WHMHWR....=....T',
    'T..=..............=....T',
    'T..=..............=....T',
    'T..=..............=....T',
    'T..================....T',
    'T......................T',
    'T....*........*........T',
    'T......................T',
    'T........======........T',
    'T........======........T',
    'T......................T',
    'T......................T',
    'TTTTTTTTTTTTTTTTTTTTTTTT',
  ]),
};
