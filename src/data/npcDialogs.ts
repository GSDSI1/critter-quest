import type { PlayerState } from '../systems/stats';

/** Per-NPC sprite tint for gym leaders, rival, champion. */
export const NPC_SPRITE_TINTS: Record<string, number> = {
  gym_leader: 0x86efac,
  gym_leader_cole: 0xfb923c,
  gym_leader_glacier: 0x7dd3fc,
  gym_leader_sage: 0xd8b4fe,
  champion: 0xfde047,
  rival: 0xf87171,
  rival2: 0xf87171,
  rival3: 0xf87171,
};

export const TRAINER_REMATCH_PROMPT = ['Want a rematch? I\'ve gotten stronger!'];

export function trainerDefeatedLines(rematched: boolean): string[] {
  return rematched
    ? ['You beat me again!', 'I\'ll keep training for next time.']
    : ['You already defeated me!', 'Keep training!'];
}

export const ELITE_REGISTRAR_CHAMPION_LINES = [
  'You are the regional Champion!',
  'Congratulations again!',
];

export const ELITE_REGISTRAR_NEED_PSYCHE = [
  'Earn the Psyche Badge before challenging the Elite Four.',
];

export const HEAL_FAREWELL = 'We hope to see you again!';

export const GENERIC_SIGN_TEXT = '...';

/** Mom's dialogue keyed off player progress. */
export function momDialogLines(p: PlayerState): string[] {
  if (p.storyFlags.champion) {
    return ['My champion!', 'I always knew you could do it!', 'Come home anytime for a rest.'];
  }
  if (p.badges.length >= 2) {
    return ['Both badges!', 'Kai keeps asking about you.', 'Be careful on Volcanic Path!'];
  }
  if (p.badges.length >= 1) {
    return ['You earned a badge!', 'Ember City is to the east.', 'I believe in you!'];
  }
  if (p.defeatedTrainers.includes('rival')) {
    return ['You beat Kai!', 'Explore Route 1 and the forest.', 'Visit the Mart for supplies!'];
  }
  return ['Be careful out there!', 'Visit the Mart for supplies, and the Healing Center to rest.'];
}

export function momDailyGiftLine(gift: 'potion' | 'oran_berry'): string {
  return gift === 'potion'
    ? 'I packed a fresh Potion for you today!'
    : 'I picked an Oran Berry from the garden for you!';
}

export function profContestWinnerLines(name: string): string[] {
  return [
    `${name}! I heard you won the Critter Contest!`,
    'The whole region is proud of you.',
  ];
}

export function profChampionLines(name: string, signsRead: number): string[] {
  const extra = signsRead >= 20
    ? 'You\'ve read every sign in the region — impressive!'
    : signsRead >= 10
      ? `${signsRead} signs read — you really explore!`
      : '';
  return [
    `${name}! The whole region is talking about you!`,
    'Champion of Verdant — you make me proud.',
    extra || 'Trainers across the region want rematches now.',
  ];
}

export const PROF_HINT_TAIL = 'Keep exploring — the region has secrets!';
