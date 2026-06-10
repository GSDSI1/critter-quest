import type { GameMap } from './types';
import { t } from './tiles';

export const route1: GameMap = {
  id: 'route1', name: 'Route 1', width: 24, height: 22,
  spawn: { x: 12, y: 20 }, encounterRate: 0.18, encounterTable: 'route1',
  warps: [
    { x: 12, y: 21, toMap: 'town', toX: 12, toY: 1 },
    { x: 12, y: 0, toMap: 'forest', toX: 12, toY: 20 },
  ],
  npcs: [
    { id: 'rival', x: 12, y: 10, name: 'Kai', role: 'rival', lines: ['I\'ve been waiting! My critter is ready!', 'Let\'s battle!'],
      trainer: { party: [{ creatureId: '__RIVAL__', level: 6 }], reward: 300 } },
    { id: 'hiker', x: 6, y: 8, name: 'Hiker Dan', role: 'trainer_m', lines: ['Wild critters hide in the tall grass!', 'Use items from your Bag in battle — press Bag!'],
      trainer: { party: [{ creatureId: 'pebblite', level: 7 }, { creatureId: 'mossling', level: 8 }], reward: 200 } },
    { id: 'lass', x: 18, y: 14, name: 'Sarah', role: 'trainer_f', lines: ['My Bloomoss is so cute!', 'Battle me!'],
      trainer: { party: [{ creatureId: 'mossling', level: 8 }, { creatureId: 'leafkit', level: 9 }], reward: 180 } },
    { id: 'sign2', x: 12, y: 18, name: 'Sign', role: 'sign', lines: ['Route 1', '↑ Verdant Forest  |  ↓ Verdant Town'] },
  ],
  tiles: t([
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T####............####..T',
    'T####............####..T',
    'T..=.............=.....T',
    'T..=....####.....=.....T',
    'T..=....####.....=.....T',
    'T..=.............=.....T',
    'T..=.............=.....T',
    'T..=.....*.......=.....T',
    'T..=.............=.....T',
    'T..=.............=.....T',
    'T..=....####.....=.....T',
    'T..=....####.....=.....T',
    'T..=.............=.....T',
    'T..=.............=.....T',
    'T..=.....S.......=.....T',
    'T..=.............=.....T',
    'T..=.............=.....T',
    'T..=.............=.....T',
    'T..=.............=.....T',
    'T..=.............=.....T',
    'TTTTTTTTTTTTTTTTTTTTTTTT',
  ]),
};
