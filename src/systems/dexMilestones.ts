import { addItem } from '../data/items';
import type { PlayerState } from './stats';

export interface DexMilestone {
  count: number;
  flag: string;
  lines: string[];
  apply: (p: PlayerState) => void;
}

export const DEX_MILESTONES: DexMilestone[] = [
  {
    count: 20,
    flag: 'dex_milestone_20',
    lines: ['Twenty species caught!', 'Here — take a Great Orb.'],
    apply: (p) => { addItem(p.items, 'great_orb', 1); },
  },
  {
    count: 40,
    flag: 'dex_milestone_40',
    lines: ['Forty on the dex!', 'You\'re a real collector. Take these.'],
    apply: (p) => { addItem(p.items, 'ultra_orb', 1); addItem(p.items, 'hyper_potion', 2); },
  },
  {
    count: 60,
    flag: 'dex_milestone_60',
    lines: ['Sixty species!', 'The region\'s rarest critters notice you now.'],
    apply: (p) => { p.money += 1000; addItem(p.items, 'ultra_orb', 2); },
  },
  {
    count: 80,
    flag: 'dex_milestone_80',
    lines: ['Eighty caught — incredible!', 'A true Critterdex master.'],
    apply: (p) => { p.money += 2000; addItem(p.items, 'contest_ribbon', 1); },
  },
  {
    count: 90,
    flag: 'dex_milestone_90',
    lines: ['Ninety on the dex!', 'The region\'s catalog is nearly complete.'],
    apply: (p) => { p.money += 3000; addItem(p.items, 'ultra_orb', 3); },
  },
];

/** Returns the highest unclaimed milestone the player qualifies for, or null. */
export function pendingDexMilestone(player: PlayerState): DexMilestone | null {
  const caught = player.dexCaught.length;
  let best: DexMilestone | null = null;
  for (const m of DEX_MILESTONES) {
    if (caught >= m.count && !player.storyFlags[m.flag]) {
      if (!best || m.count > best.count) best = m;
    }
  }
  return best;
}

export function claimDexMilestone(player: PlayerState, milestone: DexMilestone): void {
  player.storyFlags[milestone.flag] = true;
  milestone.apply(player);
}
