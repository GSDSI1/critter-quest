import type { GameMap } from './types';
import { t } from './tiles';

export const gym1: GameMap = {
  id: 'gym1', name: 'Mossgrove Gym', width: 14, height: 14,
  spawn: { x: 6, y: 11 }, encounterRate: 0,
  warps: [{ x: 6, y: 13, toMap: 'mossgrove', toX: 16, toY: 7 }],
  npcs: [
    { id: 'gym_trainer1', x: 4, y: 7, name: 'Gym Trainer Lee', lines: ['Leader Ivy is tough!', 'You\'ll face me first!'],
      trainer: { party: [{ creatureId: 'mossling', level: 13 }, { creatureId: 'bloomoss', level: 14 }], reward: 350 } },
    { id: 'gym_trainer2', x: 9, y: 5, name: 'Gym Trainer Ana', lines: ['Leaf types absorb your attacks!', 'Good luck!'],
      trainer: { party: [{ creatureId: 'vineclaw', level: 15 }, { creatureId: 'leafkit', level: 14 }], reward: 380 } },
    { id: 'gym_leader', x: 6, y: 3, name: 'Gym Leader Ivy', lines: [
      'Welcome to Mossgrove Gym!', 'I cultivate the strongest Leaf critters.', 'Show me your bond with your partners!',
    ], trainer: {
      party: [
        { creatureId: 'bloomoss', level: 16 },
        { creatureId: 'vineclaw', level: 17 },
        { creatureId: 'thornbeast', level: 18 },
      ],
      reward: 800,
      badge: 'verdant',
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
