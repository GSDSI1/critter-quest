import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import type { MapNpc, GameMap } from '../../data/maps';
import {
  ELITE_REGISTRAR_CHAMPION_LINES,
  ELITE_REGISTRAR_NEED_PSYCHE,
  GENERIC_SIGN_TEXT,
  HEAL_FAREWELL,
  PROF_HINT_TAIL,
  TRAINER_REMATCH_PROMPT,
  momDailyGiftLine,
  momDialogLines,
  profChampionLines,
  profContestWinnerLines,
  trainerDefeatedLines,
} from '../../data/npcDialogs';
import { GameState, healParty } from '../../systems/stats';
import { trySave } from '../../utils/saveFeedback';
import { DialogBox } from '../../ui/DialogBox';
import { showToast } from '../../ui/mapBanner';
import { showExclamationBubble } from '../../ui/trainerBubble';
import { Sfx } from '../../utils/audio';
import { resolveRematch } from '../../data/rematches';
import { startEliteGauntlet, findGauntletNpc } from '../../systems/eliteGauntlet';
import { addItem } from '../../data/items';
import { playDayIndex } from '../../ui/minigameShell';
import { pendingDexMilestone, claimDexMilestone } from '../../systems/dexMilestones';
import { tryHandleMinigameNpc } from './MinigameNpcHandlers';
import { momDiscoverabilityLine, profDiscoverabilityLine } from '../../systems/regionDiscovery';
import { gateOpen } from '../../systems/npcGates';
import type { TrainerBattleHandler } from './TrainerBattleHandler';

export interface NpcInteractContext {
  scene: Phaser.Scene;
  dialog: DialogBox;
  getMap: () => GameMap;
  unlockInput: () => void;
  trainerBattles: TrainerBattleHandler;
}

/** Route NPC interaction. Input lock managed by caller. */
export function handleNpcInteraction(npc: MapNpc, ctx: NpcInteractContext): boolean {
  const { dialog, scene, getMap, unlockInput, trainerBattles } = ctx;

  if (npc.gate && !gateOpen(npc)) {
    dialog.show(npc.gate!.blockLines, unlockInput);
    return true;
  }

  if (npc.id === 'elite_registrar') {
    if (GameState.player.storyFlags.champion) {
      dialog.show(ELITE_REGISTRAR_CHAMPION_LINES, unlockInput);
      return true;
    }
    if (!GameState.player.badges.includes('psyche')) {
      dialog.show(ELITE_REGISTRAR_NEED_PSYCHE, unlockInput);
      return true;
    }
    dialog.show(npc.lines, () => {
      startEliteGauntlet();
      const first = findGauntletNpc('elite_trainer1');
      if (first) {
        showExclamationBubble(scene, first.x * TILE_SIZE + 8, first.y * TILE_SIZE, () => {
          trainerBattles.launchGauntletBattle(first);
        });
      } else {
        unlockInput();
      }
    });
    return true;
  }

  const defeated = GameState.player.defeatedTrainers.includes(npc.id);
  const rematched = GameState.player.defeatedRematch.includes(npc.id);
  const rematchDef = resolveRematch(npc.id, npc.rematch);
  const champion = GameState.player.storyFlags.champion;

  if (champion && rematchDef && defeated && !rematched && npc.trainer) {
    dialog.show(TRAINER_REMATCH_PROMPT, () => trainerBattles.startTrainerBattle(npc, true));
    return true;
  }

  if (npc.trainer && !defeated) {
    dialog.show(npc.lines, () => {
      if (npc.trainer) trainerBattles.promptTrainerBattle(npc);
      else unlockInput();
    });
    return true;
  }

  if (defeated && npc.trainer) {
    dialog.show(trainerDefeatedLines(rematched), unlockInput);
    return true;
  }

  if (tryHandleMinigameNpc(npc, { scene, dialog, getMap, unlockInput })) return true;

  if (npc.lines.includes('HEAL')) {
    const welcome = npc.lines.filter(l => l !== 'HEAL');
    dialog.show(welcome, () => {
      healParty(GameState.player.party);
      Sfx.heal();
      trySave(scene);
      showToast(scene, 'Critters restored to full health!');
      dialog.show(HEAL_FAREWELL, unlockInput);
    });
    return true;
  }

  if (npc.lines.includes('SHOP')) {
    scene.scene.launch('Shop', { returnMap: getMap().id });
    scene.scene.pause();
    unlockInput();
    return true;
  }

  if (npc.lines.includes('PC')) {
    scene.scene.launch('PC');
    scene.scene.pause();
    unlockInput();
    return true;
  }

  if (npc.id === 'mom') {
    const day = playDayIndex(GameState.player.playTime);
    const lines = [...momDialogLines(GameState.player)];
    const hint = momDiscoverabilityLine(GameState.player);
    if (hint) lines.push(hint);
    if (GameState.player.lastMomGiftDay !== day) {
      GameState.player.lastMomGiftDay = day;
      const gift = Math.random() < 0.5 ? 'potion' : 'oran_berry';
      addItem(GameState.player.items, gift, 1);
      lines.unshift(momDailyGiftLine(gift));
      trySave(scene);
    }
    dialog.show(lines, unlockInput);
    return true;
  }

  if (npc.id === 'prof') {
    const milestone = pendingDexMilestone(GameState.player);
    if (milestone) {
      claimDexMilestone(GameState.player, milestone);
      trySave(scene);
      dialog.show(milestone.lines, unlockInput);
      return true;
    }
    const hint = profDiscoverabilityLine(GameState.player);
    if (hint) {
      dialog.show([hint, PROF_HINT_TAIL], unlockInput);
      return true;
    }
    if (GameState.player.storyFlags.contest_winner) {
      dialog.show(profContestWinnerLines(GameState.player.name), unlockInput);
      return true;
    }
    if (GameState.player.storyFlags.champion) {
      dialog.show(
        profChampionLines(GameState.player.name, GameState.player.signsRead),
        unlockInput,
      );
      return true;
    }
  }

  if (npc.role === 'sign' || npc.id.startsWith('sign')) {
    GameState.player.signsRead++;
    trySave(scene);
  }

  dialog.show(npc.lines, unlockInput);
  return true;
}

export function showGenericSign(dialog: DialogBox, unlockInput: () => void): void {
  dialog.show(GENERIC_SIGN_TEXT, unlockInput);
}
