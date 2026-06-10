import { getMap } from '../data/maps';
import { resolveTrainerParty } from '../data/maps/helpers';
import type { MapNpc } from '../data/maps/types';
import { GameState, createCritter, registerSeen } from './stats';

export const ELITE_GAUNTLET_ORDER = [
  'elite_trainer1', 'elite_trainer2', 'elite_trainer3', 'elite_trainer4', 'champion',
] as const;

export type GauntletTrainerId = typeof ELITE_GAUNTLET_ORDER[number];

const MAP_ID = 'victory_road';

export function isEliteGauntletActive(): boolean {
  return GameState.player.storyFlags.elite_gauntlet === true;
}

export function clearEliteGauntlet(): void {
  GameState.player.storyFlags.elite_gauntlet = false;
}

export function startEliteGauntlet(): void {
  GameState.player.storyFlags.elite_gauntlet = true;
}

export function findGauntletNpc(trainerId: string): MapNpc | undefined {
  return getMap(MAP_ID).npcs.find(n => n.id === trainerId);
}

export function buildTrainerBattleData(npc: MapNpc, levelBonus = 0) {
  if (!npc.trainer) return null;
  const partySpec = npc.trainer.party;
  const resolved = resolveTrainerParty(partySpec, GameState.player.starterId);
  const party = resolved.map(m => {
    registerSeen(GameState.player.dexSeen, m.creatureId);
    return createCritter(m.creatureId, m.level + levelBonus);
  });
  return {
    enemyParty: party,
    isTrainer: true,
    trainerId: npc.id,
    trainerName: npc.name,
    reward: npc.trainer.reward,
    badge: npc.trainer.badge ?? '',
    isRematch: false,
    mapId: MAP_ID,
    gauntlet: isEliteGauntletActive(),
  };
}

export function nextGauntletTrainerId(currentId: string): GauntletTrainerId | null {
  const idx = ELITE_GAUNTLET_ORDER.indexOf(currentId as GauntletTrainerId);
  if (idx < 0 || idx >= ELITE_GAUNTLET_ORDER.length - 1) return null;
  return ELITE_GAUNTLET_ORDER[idx + 1];
}

export function rematchLevelBonus(): number {
  return GameState.player.storyFlags.champion ? 3 : 0;
}
