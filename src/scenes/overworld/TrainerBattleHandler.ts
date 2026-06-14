import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import type { GameMap, MapNpc } from '../../data/maps';
import { resolveTrainerParty } from '../../data/maps';
import { GameState, createCritter, registerSeen } from '../../systems/stats';
import { buildTrainerBattleData, rematchLevelBonus } from '../../systems/eliteGauntlet';
import { resolveRematch } from '../../data/rematches';
import {
  buildBattleEntryData,
  enterTrainerBattle,
  enterTrainerFromBubble,
  enterWildBattle,
} from '../../ui/battleEntry';

type Critter = ReturnType<typeof createCritter>;

export class TrainerBattleHandler {
  constructor(
    private scene: Phaser.Scene,
    private getMap: () => GameMap,
    private setInputLocked: (locked: boolean) => void,
  ) {}

  startTrainerBattle(npc: MapNpc, isRematch: boolean): void {
    if (!npc.trainer) { this.setInputLocked(false); return; }
    const battleData = this.buildNpcBattleData(npc, isRematch);
    this.launchBattleFromData(battleData);
  }

  launchGauntletBattle(npc: MapNpc): void {
    const raw = buildTrainerBattleData(npc);
    if (!raw) { this.setInputLocked(false); return; }
    this.setInputLocked(true);
    enterTrainerBattle(this.scene, buildBattleEntryData(
      raw.enemyParty,
      raw.mapId,
      {
        isTrainer: true,
        trainerId: raw.trainerId,
        trainerName: raw.trainerName,
        reward: raw.reward,
        badge: raw.badge,
      },
    ));
  }

  promptTrainerBattle(npc: MapNpc): void {
    enterTrainerFromBubble(
      this.scene,
      npc.x * TILE_SIZE + 8,
      npc.y * TILE_SIZE,
      () => this.startTrainerBattle(npc, false),
    );
  }

  launchWildBattle(enemyParty: Critter[]): void {
    this.setInputLocked(true);
    enterWildBattle(this.scene, buildBattleEntryData(enemyParty, this.getMap().id));
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
    this.launchBattleFromData(buildBattleEntryData(enemyParty, this.getMap().id, {
      isTrainer,
      trainerId,
      trainerName,
      reward,
      badge,
      isRematch,
    }));
  }

  private launchBattleFromData(battleData: ReturnType<typeof buildBattleEntryData>): void {
    this.setInputLocked(true);
    if (battleData.isTrainer) {
      enterTrainerBattle(this.scene, battleData);
    } else {
      enterWildBattle(this.scene, battleData);
    }
  }

  private buildNpcBattleData(npc: MapNpc, isRematch: boolean) {
    const rematchDef = isRematch ? resolveRematch(npc.id, npc.rematch) : undefined;
    const partySpec = rematchDef?.party ?? npc.trainer!.party;
    const reward = rematchDef?.reward ?? npc.trainer!.reward;
    const resolved = resolveTrainerParty(partySpec, GameState.player.starterId);
    const bonus = isRematch ? rematchLevelBonus() : 0;
    const party = resolved.map(m => {
      registerSeen(GameState.player.dexSeen, m.creatureId);
      return createCritter(m.creatureId, m.level + bonus);
    });
    return buildBattleEntryData(party, this.getMap().id, {
      isTrainer: true,
      trainerId: npc.id,
      trainerName: npc.name,
      reward,
      badge: npc.trainer!.badge ?? '',
      isRematch,
    });
  }
}
