import type { GameMap } from './types';
import { t } from './tiles';

export const route5: GameMap = {
  id: 'route5', name: 'Route 5', width: 24, height: 22,
  spawn: { x: 12, y: 18 }, encounterRate: 0.22, encounterTable: 'route5',
  warps: [
    { x: 12, y: 19, toMap: 'frostvale', toX: 12, toY: 1 },
    { x: 12, y: 0, toMap: 'mindspire', toX: 12, toY: 17 },
  ],
  npcs: [
    { id: 'psychic_trainer', x: 8, y: 8, name: 'Psychic Luna', role: 'trainer_f', lines: ['I can read your next move!', 'Let\'s battle!'],
      trainer: { party: [{ creatureId: 'mindling', level: 27 }, { creatureId: 'dreamwisp', level: 28 }], reward: 620 } },
    { id: 'medium', x: 16, y: 12, name: 'Medium Otto', role: 'trainer_m', lines: ['Spirits guide my critters!', 'Prepare yourself!'],
      trainer: { party: [{ creatureId: 'cerebrain', level: 28 }, { creatureId: 'shadeling', level: 27 }], reward: 640 } },
    { id: 'mystic', x: 4, y: 14, name: 'Mystic Ari', role: 'trainer_f', lines: ['Psychora reads minds. Galesprite rides the wind.', 'Together we are unstoppable!'],
      trainer: { party: [{ creatureId: 'psychora', level: 29 }, { creatureId: 'galesprite', level: 30 }], reward: 680 } },
    { id: 'sign13', x: 12, y: 16, name: 'Sign', role: 'sign', lines: ['Route 5', '↓ Frostvale  |  ↑ Mindspire City'] },
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
