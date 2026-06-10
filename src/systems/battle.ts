import { getCreature } from '../data/creatures';
import { getMove } from '../data/moves';
import { getItem } from '../data/items';
import { typeMultiplier, typeLabel } from '../data/types';
import type { CritterInstance } from './stats';
import { typesOf, displayName } from './stats';
import {
  canAct, applyStatus, applyEndOfTurnStatus,
  attackMultiplier, speedMultiplier, type StatusCondition,
} from './status';
import {
  abilityAttackMult, isTypeImmune, onEnterAbility,
  contactAbilityEffect, absorbHeal,
} from '../data/abilities';

export interface BattleResult {
  damage?: number;
  missed?: boolean;
  critical?: boolean;
  effectiveness?: number;
  fainted?: boolean;
  attackerFainted?: boolean;
  message: string;
  healed?: number;
  statChange?: { stat: string; stages: number; target: 'attacker' | 'defender' };
  cantMove?: boolean;
}

type StatKey = 'atk' | 'def' | 'spa' | 'spd' | 'spe';

const STAT_LABELS: Record<StatKey, string> = {
  atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed',
};

function stageMult(stage: number): number {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

function applyStageChange(c: CritterInstance, stat: StatKey, delta: number): number {
  const before = c.statStages[stat];
  c.statStages[stat] = Math.max(-6, Math.min(6, before + delta));
  return c.statStages[stat] - before;
}

function stageChangeMessage(creature: CritterInstance, stat: StatKey, applied: number, intended: number): string {
  const label = STAT_LABELS[stat];
  if (applied === 0) {
    const dir = intended > 0 ? 'higher' : 'lower';
    return `${displayName(creature)}'s ${label} won't go any ${dir}!`;
  }
  return `${displayName(creature)}'s ${label} ${applied > 0 ? 'rose!' : 'fell!'}`;
}

function stabBonus(attacker: CritterInstance, moveType: string): number {
  return typesOf(attacker).includes(moveType as ReturnType<typeof typesOf>[0]) ? 1.5 : 1;
}

function heldTypeBoost(c: CritterInstance, moveType: string): number {
  if (!c.heldItem) return 1;
  const boosts: Record<string, string> = {
    charcoal: 'flame', mystic_water: 'tide', miracle_seed: 'leaf',
    magnet: 'volt', hard_stone: 'stone', shadow_cloth: 'shadow',
  };
  return boosts[c.heldItem] === moveType ? 1.2 : 1;
}

function isStatusImmune(c: CritterInstance, status: StatusCondition): boolean {
  if (!status) return true;
  const types = typesOf(c);
  if (status === 'burn' && types.includes('flame')) return true;
  if (status === 'paralyze' && types.includes('volt')) return true;
  if (status === 'poison' && types.includes('stone')) return true;
  if (status === 'freeze' && types.includes('flame')) return true;
  return false;
}

export function calcDamage(
  attacker: CritterInstance,
  defender: CritterInstance,
  moveId: string,
  forceCrit = false,
): { damage: number; effectiveness: number; label: string; critical: boolean } {
  const move = getMove(moveId);
  if (move.power === 0) return { damage: 0, effectiveness: 1, label: '', critical: false };

  if (isTypeImmune(defender.ability, move.type)) {
    return { damage: 0, effectiveness: 0, label: '', critical: false };
  }

  const atkStat = move.category === 'physical' ? attacker.stats.atk : attacker.stats.spa;
  const defStat = move.category === 'physical' ? defender.stats.def : defender.stats.spd;
  const atkStage = move.category === 'physical' ? attacker.statStages.atk : attacker.statStages.spa;
  const defStage = move.category === 'physical' ? defender.statStages.def : defender.statStages.spd;

  let effectiveness = 1;
  for (const defType of typesOf(defender)) {
    effectiveness *= typeMultiplier(move.type, defType);
  }

  const hpRatio = attacker.currentHp / attacker.maxHp;
  const attack = atkStat * stageMult(atkStage) * attackMultiplier(attacker);
  const defense = Math.max(1, defStat * stageMult(defStage));
  const critical = forceCrit || Math.random() < 0.0625;
  const critMult = critical ? 1.5 : 1;
  const stab = stabBonus(attacker, move.type);
  const abilityMult = abilityAttackMult(attacker.ability, move.type, hpRatio);
  const heldMult = heldTypeBoost(attacker, move.type);

  const base = Math.floor(((2 * attacker.level / 5 + 2) * move.power * attack / defense) / 50 + 2);
  const variance = 0.85 + Math.random() * 0.15;
  const damage = effectiveness <= 0 ? 0 : Math.max(1, Math.floor(base * effectiveness * stab * abilityMult * heldMult * critMult * variance));

  return { damage, effectiveness, label: typeLabel(effectiveness), critical };
}

function applyMoveStatus(defender: CritterInstance, status: StatusCondition, chance: number): string {
  if (!status || defender.status) return '';
  if (isStatusImmune(defender, status)) return '';
  if (Math.random() * 100 >= chance) return '';
  if (applyStatus(defender, status, 2 + Math.floor(Math.random() * 3))) {
    const labels: Record<string, string> = {
      burn: 'was burned!', paralyze: 'is paralyzed!', poison: 'was poisoned!',
      sleep: 'fell asleep!', freeze: 'was frozen solid!', confusion: 'became confused!',
    };
    return `${displayName(defender)} ${labels[status] ?? 'was affected!'}`;
  }
  return '';
}

export function executeMove(
  attacker: CritterInstance,
  defender: CritterInstance,
  moveIndex: number,
): BattleResult {
  const actCheck = canAct(attacker);
  if (!actCheck.ok) {
    if (actCheck.attackerFainted) {
      return { message: actCheck.message!, attackerFainted: true, cantMove: true };
    }
    return { message: actCheck.message!, cantMove: true };
  }

  const battleMove = attacker.moves[moveIndex];
  if (!battleMove || battleMove.pp <= 0) {
    return { message: 'No PP left for that move!' };
  }

  const move = getMove(battleMove.id);
  battleMove.pp--;

  if (Math.random() * 100 > move.accuracy) {
    return { missed: true, message: `${displayName(attacker)}'s ${move.name} missed!` };
  }

  const absorb = absorbHeal(defender.ability, move.type);
  if (absorb && move.power > 0) {
    const heal = Math.floor(defender.maxHp * absorb);
    defender.currentHp = Math.min(defender.maxHp, defender.currentHp + heal);
    return { healed: heal, message: `${displayName(defender)} absorbed the attack!` };
  }

  if (move.effect === 'heal') {
    const heal = Math.floor(attacker.maxHp * (move.effectValue ?? 0.5));
    const before = attacker.currentHp;
    attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + heal);
    return { healed: attacker.currentHp - before, message: `${displayName(attacker)} recovered ${attacker.currentHp - before} HP!` };
  }

  if (move.effect === 'boost-atk' || move.effect === 'boost-def') {
    const stat: StatKey = move.effect === 'boost-atk' ? 'atk' : 'def';
    const intended = move.effectValue ?? -1;
    const targetSide = move.effectTarget ?? 'foe';
    const target = targetSide === 'self' ? attacker : defender;
    const applied = applyStageChange(target, stat, intended);
    return {
      message: stageChangeMessage(target, stat, applied, intended),
      statChange: { stat, stages: applied, target: targetSide === 'self' ? 'attacker' : 'defender' },
    };
  }

  if (move.power === 0 && move.effect) {
    const statusMap: Record<string, StatusCondition> = {
      sleep: 'sleep', paralyze: 'paralyze', burn: 'burn', poison: 'poison',
      thunderwave: 'paralyze', hypnosis: 'sleep',
    };
    const status = statusMap[move.effect];
    if (status) {
      const msg = applyMoveStatus(defender, status, move.effectChance ?? 100);
      return { message: msg || `${displayName(attacker)} used ${move.name}! It had no effect.` };
    }
  }

  const { damage, effectiveness, label, critical } = calcDamage(attacker, defender, battleMove.id);
  if (effectiveness <= 0) {
    return { message: `${displayName(attacker)} used ${move.name}! It doesn't affect ${displayName(defender)}...` };
  }

  defender.currentHp = Math.max(0, defender.currentHp - damage);
  const fainted = defender.currentHp <= 0;

  let message = `${displayName(attacker)} used ${move.name}!`;
  if (critical) message += ' A critical hit!';
  if (label) message += ` ${label}`;

  if (move.effect && move.effectChance && !fainted) {
    const statusMap: Record<string, StatusCondition> = {
      burn: 'burn', paralyze: 'paralyze', poison: 'poison', sleep: 'sleep',
    };
    const status = statusMap[move.effect];
    const statusMsg = status ? applyMoveStatus(defender, status, move.effectChance) : '';
    if (statusMsg) message += ` ${statusMsg}`;
  }

  if (move.category === 'physical' && !fainted) {
    const contact = contactAbilityEffect(defender.ability);
    if (contact) {
      const msg = applyMoveStatus(attacker, contact, 100);
      if (msg) message += ` ${msg}`;
    }
  }

  if (fainted) message += ` ${displayName(defender)} fainted!`;

  return { damage, effectiveness, critical, fainted, message };
}

export function applyEnterAbility(defender: CritterInstance, attacker: CritterInstance): string | null {
  const effect = onEnterAbility(defender.ability);
  if (effect) {
    attacker.statStages.atk = Math.max(-6, Math.min(6, attacker.statStages.atk + effect.stages));
    return effect.message;
  }
  return null;
}

export function endOfTurnStatus(c: CritterInstance): string | null {
  return applyEndOfTurnStatus(c);
}

export function tryCatchWithItem(wild: CritterInstance, itemId: string): { caught: boolean; shakes: number; message: string } {
  const item = getItem(itemId);
  const def = getCreature(wild.speciesId);
  const hpFactor = (wild.maxHp * 3 - wild.currentHp * 2) / (wild.maxHp * 3);
  const catchValue = hpFactor * (def.catchRate / 255) * (item.catchBonus ?? 1);
  const shakes = catchValue > 0.7 ? 3 : catchValue > 0.4 ? 2 : catchValue > 0.15 ? 1 : 0;
  const caught = Math.random() < Math.min(0.92, catchValue * 1.15 + 0.14);

  let message = `You threw a ${item.name}!`;
  if (caught) message += ' Gotcha! Critter was caught!';
  else if (shakes === 0) message += ' It broke free immediately!';
  else message += ` It shook ${shakes} time${shakes > 1 ? 's' : ''}... and escaped!`;

  return { caught, shakes, message };
}

export function tryRun(playerSpe: number, enemySpe: number, blocked = false): boolean {
  if (blocked) return false;
  return Math.random() < Math.min(0.95, (playerSpe * 128 / Math.max(1, enemySpe) + 30 * 256) / 256 / 256);
}

export function effectiveSpeed(c: CritterInstance): number {
  return Math.floor(c.stats.spe * speedMultiplier(c));
}

export function pickAiMove(enemy: CritterInstance, player: CritterInstance): number {
  const available = enemy.moves.map((m, i) => ({ i, move: getMove(m.id), pp: m.pp })).filter(m => m.pp > 0);
  if (!available.length) return 0;
  let best = available[0];
  let bestScore = -1;
  for (const cand of available) {
    if (cand.move.power === 0) {
      const score = 5 + Math.random() * 5;
      if (score > bestScore) { bestScore = score; best = cand; }
      continue;
    }
    const { damage, effectiveness } = calcDamage(enemy, player, cand.move.id);
    const score = damage * effectiveness + Math.random() * 10;
    if (score > bestScore) { bestScore = score; best = cand; }
  }
  return best.i;
}

export function expGain(defeated: CritterInstance, isWild: boolean): number {
  const def = getCreature(defeated.speciesId);
  return Math.floor(((isWild ? def.expYield : def.expYield * 1.5) * defeated.level) / 7);
}

export function moneyLossOnBlackout(money: number): number {
  return Math.max(0, Math.floor(money / 2));
}

export function tryHeldBerry(c: CritterInstance): string | null {
  if (c.heldItem !== 'oran_berry' || c.currentHp <= 0) return null;
  if (c.currentHp <= c.maxHp / 2) {
    c.currentHp = Math.min(c.maxHp, c.currentHp + 10);
    c.heldItem = undefined;
    return `${displayName(c)} ate its Oran Berry!`;
  }
  return null;
}

export function isRunBlocked(defenderAbility: string): boolean {
  return defenderAbility === 'shadow_tag';
}
