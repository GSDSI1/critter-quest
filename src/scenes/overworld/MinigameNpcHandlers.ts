import Phaser from 'phaser';
import type { MapNpc, GameMap } from '../../data/maps';
import { GameState } from '../../systems/stats';
import { trySave } from '../../utils/saveFeedback';
import { DialogBox } from '../../ui/DialogBox';
import { isNight } from '../../systems/dayNight';
import { applyChestReward } from './ChestRewards';

export interface MinigameNpcContext {
  scene: Phaser.Scene;
  dialog: DialogBox;
  getMap: () => GameMap;
  unlockInput: () => void;
}

/** Handle FISH / BUGCATCH / CONTEST / CHEST / COIN tokens. Returns true if handled. */
export function tryHandleMinigameNpc(npc: MapNpc, ctx: MinigameNpcContext): boolean {
  if (npc.lines.includes('FISH')) {
    const intro = npc.lines.filter(l => l !== 'FISH');
    ctx.dialog.show(intro, () => {
      ctx.unlockInput();
      ctx.scene.scene.launch('Fishing', { returnMap: ctx.getMap().id });
      ctx.scene.scene.pause();
    });
    return true;
  }

  if (npc.lines.includes('BUGCATCH')) {
    const caught = GameState.player.dexCaught.length;
    const night = isNight(GameState.player.playTime);
    if (caught < 5) {
      ctx.dialog.show([
        'Firefly Challenge — locked.',
        `Dex: ${caught}/5 species caught.`,
        'Explore tall grass and catch more critters first!',
      ], () => { ctx.unlockInput(); });
      return true;
    }
    if (!night) {
      ctx.dialog.show([
        `You're ready (${caught} species on the dex)!`,
        'Fireflies only appear at night — watch for ☾ on the HUD.',
        'Come back when the moon is out.',
      ], () => { ctx.unlockInput(); });
      return true;
    }
    const intro = npc.lines.filter(l => l !== 'BUGCATCH');
    ctx.dialog.show(intro, () => {
      ctx.unlockInput();
      ctx.scene.scene.launch('BugCatch');
      ctx.scene.scene.pause();
    });
    return true;
  }

  if (npc.lines.includes('CONTEST')) {
    const intro = npc.lines.filter(l => l !== 'CONTEST');
    ctx.dialog.show(intro, () => {
      ctx.unlockInput();
      ctx.scene.scene.launch('CritterContest');
      ctx.scene.scene.pause();
    });
    return true;
  }

  if (npc.lines.includes('CHEST')) {
    const chestIdx = npc.lines.indexOf('CHEST');
    const chestId = chestIdx >= 0 && npc.lines[chestIdx + 1] ? npc.lines[chestIdx + 1] : npc.id;
    if (GameState.player.storyFlags[chestId]) {
      ctx.dialog.show(['The chest is empty.'], () => { ctx.unlockInput(); });
      return true;
    }
    GameState.player.storyFlags[chestId] = true;
    const lines = applyChestReward(chestId);
    trySave(ctx.scene);
    ctx.dialog.show(lines, () => { ctx.unlockInput(); });
    return true;
  }

  if (npc.lines.includes('COIN')) {
    if (GameState.player.money < 100) {
      ctx.dialog.show(['You need $100 to play.', 'Come back when you have more!'], () => {
        ctx.unlockInput();
      });
      return true;
    }
    GameState.player.money -= 100;
    const win = Math.random() < 0.35;
    if (win) {
      GameState.player.money += 300;
      trySave(ctx.scene);
      ctx.dialog.show(['Jackpot! You won $300!'], () => { ctx.unlockInput(); });
    } else {
      trySave(ctx.scene);
      ctx.dialog.show(['No luck this time...'], () => { ctx.unlockInput(); });
    }
    return true;
  }

  return false;
}
