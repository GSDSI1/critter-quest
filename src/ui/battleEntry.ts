import Phaser from 'phaser';
import type { CritterInstance } from '../systems/stats';
import { playEncounterTransition } from './encounterTransition';
import { showExclamationBubble } from './trainerBubble';

export interface BattleEntryData {
  enemyParty: CritterInstance[];
  isTrainer: boolean;
  trainerId: string;
  trainerName: string;
  reward: number;
  badge: string;
  isRematch?: boolean;
  mapId: string;
}

export function buildBattleEntryData(
  enemyParty: CritterInstance[],
  mapId: string,
  opts: {
    isTrainer?: boolean;
    trainerId?: string;
    trainerName?: string;
    reward?: number;
    badge?: string;
    isRematch?: boolean;
  } = {},
): BattleEntryData {
  return {
    enemyParty,
    isTrainer: opts.isTrainer ?? false,
    trainerId: opts.trainerId ?? '',
    trainerName: opts.trainerName ?? '',
    reward: opts.reward ?? 0,
    badge: opts.badge ?? '',
    isRematch: opts.isRematch ?? false,
    mapId,
  };
}

/** Wild encounter: single flash+wipe then straight into Battle. */
export function enterWildBattle(scene: Phaser.Scene, battleData: BattleEntryData): void {
  playEncounterTransition(scene, () => {
    scene.cameras.main.fadeOut(1, 0, 0, 0);
    scene.scene.start('Battle', { ...battleData, _fadeIn: true });
  });
}

/** Trainer battle — VS intro then wipe into Battle. */
export function enterTrainerBattle(
  scene: Phaser.Scene,
  battleData: BattleEntryData,
  opts: { introHoldMs?: number } = {},
): void {
  scene.scene.start('TrainerIntro', {
    trainerName: battleData.trainerName,
    isTrainer: true,
    battleData,
    introHoldMs: opts.introHoldMs ?? 1500,
  });
}

/** Trainer spotted: bubble animation then callback. */
export function enterTrainerFromBubble(
  scene: Phaser.Scene,
  x: number,
  y: number,
  onReady: () => void,
): void {
  showExclamationBubble(scene, x, y, onReady);
}
