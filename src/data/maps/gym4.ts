import type { GameMap } from './types';
import { t } from './tiles';

export const gym4: GameMap = {
  id: 'gym4', name: 'Mindspire Gym', width: 14, height: 14,
  spawn: { x: 6, y: 11 }, encounterRate: 0,
  warps: [{ x: 6, y: 13, toMap: 'mindspire', toX: 16, toY: 7 }],
  npcs: [
    { id: 'gym4_trainer1', x: 4, y: 7, name: 'Gym Trainer Mindy', role: 'trainer_f', lines: ['Psychic types see through tricks!', 'You\'ll face me first!'],
      trainer: { party: [{ creatureId: 'mindling', level: 29 }, { creatureId: 'dreamwisp', level: 30 }], reward: 600 } },
    { id: 'gym4_trainer2', x: 9, y: 5, name: 'Gym Trainer Kent', role: 'trainer_m', lines: ['Sage\'s mind is unmatched!', 'Good luck!'],
      trainer: { party: [{ creatureId: 'cerebrain', level: 31 }, { creatureId: 'psyknight', level: 30 }], reward: 620 } },
    { id: 'gym_leader_sage', x: 6, y: 3, name: 'Gym Leader Sage', role: 'leader', lines: [
      'Welcome to Mindspire Gym!', 'I commune with Psychic critters.', 'Let your mind be tested!',
    ], trainer: {
      party: [
        { creatureId: 'cerebrain', level: 32 },
        { creatureId: 'somnara', level: 33 },
        { creatureId: 'astralyn', level: 34 },
      ],
      reward: 1400,
      badge: 'psyche',
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
