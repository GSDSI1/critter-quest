import type { PlayerState } from '../systems/stats';

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  isComplete(p: PlayerState): boolean;
  reward: { money?: number; item?: string; itemCount?: number };
}

export const QUESTS: QuestDef[] = [
  {
    id: 'first_catch',
    name: 'First Friends',
    description: 'Catch 5 different species.',
    isComplete: p => p.dexCaught.length >= 5,
    reward: { item: 'capture_orb', itemCount: 5 },
  },
  {
    id: 'first_badge',
    name: 'Proven in Battle',
    description: 'Earn your first gym badge.',
    isComplete: p => p.badges.length >= 1,
    reward: { money: 500 },
  },
  {
    id: 'defeat_ranger',
    name: 'Ranger Rumble',
    description: 'Defeat the Ranger blocking Route 2.',
    isComplete: p => p.storyFlags.defeated_ranger === true,
    reward: { item: 'potion', itemCount: 3 },
  },
  {
    id: 'catch_20',
    name: 'Collector',
    description: 'Catch 20 different species.',
    isComplete: p => p.dexCaught.length >= 20,
    reward: { item: 'great_orb', itemCount: 5 },
  },
  {
    id: 'contest_champ',
    name: 'Star of the Show',
    description: 'Win the Critter Contest.',
    isComplete: p => p.storyFlags.contest_winner === true,
    reward: { money: 1000 },
  },
  {
    id: 'fishing_pro',
    name: 'Master Angler',
    description: 'Land 2 or more hits in one fishing session.',
    isComplete: p => p.fishingBest >= 2,
    reward: { item: 'sitrus_berry', itemCount: 2 },
  },
  {
    id: 'explorer',
    name: 'Wanderer',
    description: 'Visit 15 different areas.',
    isComplete: p => p.visitedMaps.length >= 15,
    reward: { money: 800 },
  },
  {
    id: 'four_badges',
    name: 'League Contender',
    description: 'Collect all 4 gym badges.',
    isComplete: p => p.badges.length >= 4,
    reward: { item: 'ultra_orb', itemCount: 3 },
  },
  {
    id: 'catch_60',
    name: 'Dex Devotee',
    description: 'Catch 60 different species.',
    isComplete: p => p.dexCaught.length >= 60,
    reward: { money: 2500 },
  },
  {
    id: 'champion',
    name: 'Hall of Famer',
    description: 'Defeat the Champion.',
    isComplete: p => p.storyFlags.champion === true,
    reward: { money: 5000 },
  },
];

export function questClaimFlag(id: string): string {
  return `quest_${id}_claimed`;
}

export function isQuestClaimed(p: PlayerState, id: string): boolean {
  return p.storyFlags[questClaimFlag(id)] === true;
}

/** Quests completed but not yet claimed. */
export function claimableQuests(p: PlayerState): QuestDef[] {
  return QUESTS.filter(q => q.isComplete(p) && !isQuestClaimed(p, q.id));
}

export function questRewardLabel(q: QuestDef): string {
  const parts: string[] = [];
  if (q.reward.money) parts.push(`$${q.reward.money}`);
  if (q.reward.item) parts.push(`${q.reward.item.replace(/_/g, ' ')} x${q.reward.itemCount ?? 1}`);
  return parts.join(' + ');
}

/** 0–1 progress toward quest completion (for UI bars). */
export function questProgress(p: PlayerState, q: QuestDef): number {
  if (q.isComplete(p)) return 1;
  switch (q.id) {
    case 'first_catch': return Math.min(1, p.dexCaught.length / 5);
    case 'catch_20': return Math.min(1, p.dexCaught.length / 20);
    case 'catch_60': return Math.min(1, p.dexCaught.length / 60);
    case 'first_badge': return Math.min(1, p.badges.length);
    case 'four_badges': return Math.min(1, p.badges.length / 4);
    case 'explorer': return Math.min(1, p.visitedMaps.length / 15);
    case 'fishing_pro': return Math.min(1, p.fishingBest / 2);
    default: return q.isComplete(p) ? 1 : 0;
  }
}
