import type { GameMap } from './types';
import { t } from './tiles';

export const gym2: GameMap = {
  id: 'gym2', name: 'Ember City Gym', width: 14, height: 14,
  spawn: { x: 6, y: 11 }, encounterRate: 0,
  warps: [{ x: 6, y: 13, toMap: 'ember_city', toX: 16, toY: 7 }],
  npcs: [
    { id: 'gym2_trainer1', x: 4, y: 7, name: 'Gym Trainer Rex', role: 'trainer_m', lines: ['Flame types burn bright here!', 'You\'ll face me first!'],
      trainer: { party: [{ creatureId: 'cinderkit', level: 17 }, { creatureId: 'emberpup', level: 18 }], reward: 400 } },
    { id: 'gym2_trainer2', x: 9, y: 5, name: 'Gym Trainer Fay', role: 'trainer_f', lines: ['Cole is the strongest trainer in Ember City!', 'Good luck!'],
      trainer: { party: [{ creatureId: 'flamewyrm', level: 19 }, { creatureId: 'voltite', level: 18 }], reward: 420 } },
    { id: 'gym_leader_cole', x: 6, y: 3, name: 'Gym Leader Cole', role: 'leader', lines: [
      'Welcome to Ember City Gym!', 'I forge the hottest flame critters.', 'Show me your fighting spirit!',
    ], trainer: {
      party: [
        { creatureId: 'cinderkit', level: 20 },
        { creatureId: 'flamewyrm', level: 21 },
        { creatureId: 'emberlord', level: 22 },
      ],
      reward: 1000,
      badge: 'ember',
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
