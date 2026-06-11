import Phaser from 'phaser';
import type { PlayerState } from './stats';
import { registerCaught } from './stats';
import { pendingDexMilestone } from './dexMilestones';
import { showToast } from '../ui/mapBanner';

/** Register a dex catch and toast if a milestone reward is waiting at the lab. */
export function registerCaughtWithMilestone(
  player: PlayerState,
  speciesId: string,
  scene?: Phaser.Scene,
): boolean {
  const isNew = !player.dexCaught.includes(speciesId);
  registerCaught(player.dexCaught, speciesId, player.dexSeen);
  if (isNew && scene) {
    const milestone = pendingDexMilestone(player);
    if (milestone) {
      showToast(scene, `Dex ${milestone.count}! Visit Prof. Elmwood in the lab.`, 2400);
    }
  }
  return isNew;
}
