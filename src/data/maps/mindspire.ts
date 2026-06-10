import type { GameMap } from './types';
import { t } from './tiles';

export const mindspire: GameMap = {
  id: 'mindspire', name: 'Mindspire City', width: 24, height: 20,
  spawn: { x: 12, y: 16 }, encounterRate: 0,
  warps: [
    { x: 12, y: 18, toMap: 'route5', toX: 12, toY: 1 },
    { x: 8, y: 6, toMap: 'heal_center', toX: 4, toY: 7 },
    { x: 12, y: 6, toMap: 'mart', toX: 4, toY: 7 },
    { x: 16, y: 6, toMap: 'gym4', toX: 6, toY: 11 },
    { x: 12, y: 0, toMap: 'victory_road', toX: 12, toY: 18, requiresBadge: 'psyche' },
  ],
  npcs: [
    { id: 'guide4', x: 12, y: 12, name: 'City Guide', role: 'generic', lines: ['Welcome to Mindspire!', 'Gym Leader Sage reads every challenger.', 'Victory Road opens after the Psyche Badge.'] },
    { id: 'sage_apprentice', x: 18, y: 10, name: 'Apprentice Ray', role: 'trainer_m', lines: ['My psychic training is complete!', 'Battle me!'],
      trainer: { party: [{ creatureId: 'psyknight', level: 29 }, { creatureId: 'somnara', level: 30 }], reward: 660 } },
    { id: 'sign14', x: 12, y: 14, name: 'Sign', role: 'sign', lines: ['Mindspire City', 'Gym →  |  ↑ Victory Road (badge required)'] },
  ],
  tiles: t([
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T..........====........T',
    'T..........====........T',
    'T......................T',
    'T..================....T',
    'T..=..............=....T',
    'T..=....WHGRRR....=....T',
    'T..=..............=....T',
    'T..=..............=....T',
    'T..=..............=....T',
    'T..================....T',
    'T......................T',
    'T....*........*........T',
    'T......................T',
    'T........S.............T',
    'T......................T',
    'T........======........T',
    'T........======........T',
    'T......................T',
    'TTTTTTTTTTTTTTTTTTTTTTTT',
  ]),
};
