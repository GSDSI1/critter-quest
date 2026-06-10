import type { GameMap } from './types';
import { t } from './tiles';

export const gym3: GameMap = {
  id: 'gym3', name: 'Frostvale Gym', width: 14, height: 14,
  spawn: { x: 6, y: 11 }, encounterRate: 0,
  warps: [{ x: 6, y: 13, toMap: 'frostvale', toX: 16, toY: 7 }],
  npcs: [
    { id: 'gym3_trainer1', x: 4, y: 7, name: 'Gym Trainer Cole', role: 'trainer_m', lines: ['Ice types freeze the competition!', 'You\'ll face me first!'],
      trainer: { party: [{ creatureId: 'snowpuff', level: 23 }, { creatureId: 'glacetail', level: 24 }], reward: 520 } },
    { id: 'gym3_trainer2', x: 9, y: 5, name: 'Gym Trainer Iris', role: 'trainer_f', lines: ['Glacier is the coldest leader around!', 'Good luck!'],
      trainer: { party: [{ creatureId: 'blizzhound', level: 25 }, { creatureId: 'frosthorn', level: 24 }], reward: 540 } },
    { id: 'gym_leader_glacier', x: 6, y: 3, name: 'Gym Leader Glacier', role: 'leader', lines: [
      'Welcome to Frostvale Gym!', 'I train the fiercest Ice critters.', 'Feel the chill of defeat!',
    ], trainer: {
      party: [
        { creatureId: 'glacetail', level: 26 },
        { creatureId: 'blizzhound', level: 27 },
        { creatureId: 'arctodon', level: 28 },
      ],
      reward: 1200,
      badge: 'frost',
    } },
  ],
  tiles: t([
    'WWWWWWWWWWWWWW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFGFFFFFFW',
    'WFFFFFFFFFFFFFW',
    'WFFFFFFFDFFFFFFW',
    'WWWWWWWWWWWWWW',
  ]),
};
