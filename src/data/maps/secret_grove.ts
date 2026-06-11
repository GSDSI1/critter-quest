import type { GameMap } from './types';
import { t } from './tiles';

export const secret_grove: GameMap = {
  id: 'secret_grove', name: 'Secret Grove', width: 20, height: 16,
  spawn: { x: 10, y: 14 }, encounterRate: 0.28, encounterTable: 'secret_grove',
  warps: [
    { x: 10, y: 15, toMap: 'forest', toX: 18, toY: 8 },
  ],
  npcs: [
    { id: 'grove_sage', x: 10, y: 6, name: 'Grove Sage', role: 'generic', lines: [
      'Few trainers find this place.',
      'The rarest critters gather where moonlight filters through.',
    ] },
    { id: 'chest_grove', x: 4, y: 10, name: 'Chest', role: 'chest', lines: ['CHEST', 'grove_chest'] },
    { id: 'sign_grove', x: 10, y: 2, name: 'Sign', role: 'sign', lines: ['Secret Grove', 'A hidden sanctuary beyond the forest.'] },
  ],
  tiles: t([
    'TTTTTTTTTTTTTTTTTTTT',
    'T####..........####T',
    'T####..........####T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=....**.......=T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=.............=T',
    'T..=.............=T',
    'TTTTTTTTTTTTTTTTTTTT',
  ]),
};
