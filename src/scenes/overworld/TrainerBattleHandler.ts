import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import type { GameMap, MapNpc } from '../../data/maps';
import { resolveTrainerParty } from '../../data/maps';
import { GameState, createCritter, registerSeen } from '../../systems/stats';
import { buildTrainerBattleData, rematchLevelBonus } from '../../systems/eliteGauntlet';
import { resolveRematch } from '../../data/rematches';
import { showExclamationBubble } from '../TrainerIntroScene';

type Critter = ReturnType<typeof createCritter>;

export class TrainerBattleHandler {
  constructor(
    private scene: Phaser.Scene,
    private getMap: () => GameMap,
    private setInputLocked: (locked: boolean) => void,
  ) {}

  startTrainerBattle(npc: MapNpc, isRematch: boolean): void {
    if (!npc.trainer) { this.setInputLocked(false); return; }
    const rematchDef = isRematch ? resolveRematch(npc.id, npc.rematch) : undefined;
    const partySpec = rematchDef?.party ?? npc.trainer.party;
    const reward = rematchDef?.reward ?? npc.trainer.reward;
    const resolved = resolveTrainerParty(partySpec, GameState.player.starterId);
    const bonus = isRematch ? rematchLevelBonus() : 0;
    const party = resolved.map(m => {
      registerSeen(GameState.player.dexSeen, m.creatureId);
      return createCritter(m.creatureId, m.level + bonus);
    });
    this.launchBattle(party, true, npc.id, npc.name, reward, npc.trainer.badge ?? '', isRematch);
  }

  launchGauntletBattle(npc: MapNpc): void {
    const battleData = buildTrainerBattleData(npc);
    if (!battleData) { this.setInputLocked(false); return; }
    this.setInputLocked(true);
    this.scene.cameras.main.flash(200, 255, 255, 255);
    this.scene.time.delayedCall(300, () => {
      this.scene.scene.start('TrainerIntro', {
        trainerName: npc.name,
        isTrainer: true,
        battleData,
      });
    });
  }

  promptTrainerBattle(npc: MapNpc): void {
    showExclamationBubble(this.scene, npc.x * TILE_SIZE + 8, npc.y * TILE_SIZE, () => {
      this.startTrainerBattle(npc, false);
    });
  }

  launchBattle(
    enemyParty: Critter[],
    isTrainer: boolean,
    trainerId: string,
    trainerName: string,
    reward: number,
    badge: string,
    isRematch = false,
  ): void {
    this.setInputLocked(true);
    this.scene.cameras.main.flash(200, 255, 255, 255);

    const battleData = {
      enemyParty,
      isTrainer,
      trainerId,
      trainerName,
      reward,
      badge,
      isRematch,
      mapId: this.getMap().id,
    };

    this.scene.time.delayedCall(300, () => {
      this.scene.scene.start('TrainerIntro', {
        trainerName: isTrainer ? trainerName : 'Wild',
        isTrainer,
        battleData,
      });
    });
  }
}
