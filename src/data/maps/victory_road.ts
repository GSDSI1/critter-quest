import type { GameMap } from './types';
import { t } from './tiles';

export const victory_road: GameMap = {
  id: 'victory_road', name: 'Victory Road', width: 24, height: 22,
  spawn: { x: 12, y: 18 }, encounterRate: 0.28, encounterTable: 'victory_road',
  warps: [
    { x: 12, y: 19, toMap: 'mindspire', toX: 12, toY: 1 },
  ],
  npcs: [
    { id: 'elite_registrar', x: 12, y: 14, name: 'League Registrar', role: 'generic', lines: [
      'Welcome to the Elite Four chamber.',
      'Defeat all four Elites and the Champion in a row — no healing between!',
      'Ready to begin the gauntlet?',
    ] },
    { id: 'elite_trainer1', x: 4, y: 10, name: 'Elite Ace Dana', role: 'trainer_f', lines: ['Only the strongest reach the summit!', 'Show me your team!'],
      trainer: { party: [{ creatureId: 'voidseer', level: 35 }, { creatureId: 'glaciorex', level: 36 }], reward: 800 } },
    { id: 'elite_trainer2', x: 10, y: 8, name: 'Elite Ace Max', role: 'trainer_m', lines: ['Victory Road breaks weak trainers!', 'Let\'s battle!'],
      trainer: { party: [{ creatureId: 'zenolith', level: 36 }, { creatureId: 'infernox', level: 35 }], reward: 820 } },
    { id: 'elite_trainer3', x: 16, y: 8, name: 'Elite Ace Rin', role: 'trainer_f', lines: ['Ice and stone — my specialty!', 'Freeze!'],
      trainer: { party: [{ creatureId: 'arctodon', level: 37 }, { creatureId: 'blizzhound', level: 36 }], reward: 840 } },
    { id: 'elite_trainer4', x: 20, y: 5, name: 'Elite Ace Cole', role: 'trainer_m', lines: ['The final Elite awaits the worthy.', 'Battle!'],
      trainer: { party: [{ creatureId: 'astralyn', level: 38 }, { creatureId: 'somnara', level: 37 }], reward: 860 } },
    { id: 'champion', x: 12, y: 2, name: 'Champion Vera', role: 'leader', lines: [
      'You\'ve come far, trainer.', 'I am Champion Vera — the final test.', 'Give me everything you\'ve got!',
    ], trainer: {
      party: [
        { creatureId: 'arctodon', level: 38 },
        { creatureId: 'astralyn', level: 39 },
        { creatureId: 'zenolith', level: 40 },
        { creatureId: 'infernox', level: 40 },
      ],
      reward: 2000,
    } },
    { id: 'sign15', x: 12, y: 16, name: 'Sign', role: 'sign', lines: ['Victory Road', '↓ Mindspire  |  ↑ Hall of Fame ahead'] },
  ],
  tiles: t([
    'KKKKKKKKKKKKKKKKKKKKKKKK',
    'KCC..............CC....K',
    'KCC..OOOO........CC....K',
    'KCC..............CC....K',
    'KCC....####......CC....K',
    'KCC....####......CC....K',
    'KCC..............CC....K',
    'KCC......**......CC....K',
    'KCC..............CC....K',
    'KCC....####......CC....K',
    'KCC....####......CC....K',
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KCC......S.......CC....K',
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KCC..............CC....K',
    'KKKKKKKKKKKKKKKKKKKKKKKK',
  ]),
};
