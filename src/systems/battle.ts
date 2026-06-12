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
import { defaultRng, type Rng } from './rng';

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

export function stageMult(stage: number): number {
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
    charcoal: 'flame', mystic_water: 'tide', silk_scarf: 'leaf',
    never_melt_ice: 'ice', twisted_spoon: 'psychic',
    magnet: 'volt', hard_stone: 'stone', shadow_cloth: 'shadow',
  };
  return boosts[c.heldItem] === moveType ? 1.2 : 1;
}

function heldCritBoost(c: CritterInstance): number {
  return c.heldItem === 'scope_lens' ? 0.125 : 0.0625;
}

function isStatusImmune(c: CritterInstance, status: StatusCondition): boolean {
  if (!status) return true;
  if (status === 'sleep' && c.ability === 'insomnia') return true;
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
  rng: Rng = defaultRng,
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
  const critical = forceCrit || rng.chance(heldCritBoost(attacker));
  const critMult = critical ? 1.5 : 1;
  const stab = stabBonus(attacker, move.type);
  const abilityMult = abilityAttackMult(attacker.ability, move.type, hpRatio, attacker.vol?.flashFireActive);
  const heldMult = heldTypeBoost(attacker, move.type);

  const base = Math.floor(((2 * attacker.level / 5 + 2) * move.power * attack / defense) / 50 + 2);
  const variance = 0.85 + rng.next() * 0.15;
  let damage = effectiveness <= 0 ? 0 : Math.max(1, Math.floor(base * effectiveness * stab * abilityMult * heldMult * critMult * variance));
  if (defender.ability === 'thick_fat' && (move.type === 'flame' || move.type === 'ice') && damage > 0) {
    damage = Math.max(1, Math.floor(damage / 2));
  }

  return { damage, effectiveness, label: typeLabel(effectiveness), critical };
}

export function applyMoveStatus(
  defender: CritterInstance,
  status: StatusCondition,
  chance: number,
  rng: Rng,
  attacker?: CritterInstance,
): string {
  if (!status || defender.status) return '';
  if (isStatusImmune(defender, status)) return '';
  if (rng.next() * 100 >= chance) return '';
  if (applyStatus(defender, status, 2 + rng.int(0, 2))) {
    if (defender.heldItem === 'lum_berry') {
      defender.status = null;
      defender.statusTurns = 0;
      defender.heldItem = undefined;
      return `${displayName(defender)} ate its Lum Berry!`;
    }
    const labels: Record<string, string> = {
      burn: 'was burned!', paralyze: 'is paralyzed!', poison: 'was poisoned!',
      sleep: 'fell asleep!', freeze: 'was frozen solid!', confusion: 'became confused!',
    };
    let msg = `${displayName(defender)} ${labels[status] ?? 'was affected!'}`;
    if (attacker && defender.ability === 'synchronize' && ['burn', 'poison', 'paralyze'].includes(status ?? '')) {
      if (!attacker.status && !isStatusImmune(attacker, status)) {
        applyStatus(attacker, status, 2 + rng.int(0, 2));
        msg += ` ${displayName(attacker)} was synchronized!`;
      }
    }
    return msg;
  }
  return '';
}

export function executeMove(
  attacker: CritterInstance,
  defender: CritterInstance,
  moveIndex: number,
  rng: Rng = defaultRng,
): BattleResult {
  if (attacker.vol?.flinched) {
    attacker.vol.flinched = false;
    return { message: `${displayName(attacker)} flinched and couldn't move!`, cantMove: true };
  }
  const actCheck = canAct(attacker, rng);
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

  let accuracy = move.accuracy;
  if (defender.ability === 'snow_cloak') accuracy *= 0.85;

  if (rng.next() * 100 > accuracy) {
    return { missed: true, message: `${displayName(attacker)}'s ${move.name} missed!` };
  }

  const absorb = absorbHeal(defender.ability, move.type);
  if (absorb && move.power > 0) {
    const heal = Math.floor(defender.maxHp * absorb);
    defender.currentHp = Math.min(defender.maxHp, defender.currentHp + heal);
    return { healed: heal, message: `${displayName(defender)} absorbed the attack!` };
  }

  if (move.power > 0 && isTypeImmune(defender.ability, move.type)) {
    if (defender.ability === 'flash_fire' && move.type === 'flame') {
      defender.vol = defender.vol ?? {};
      defender.vol.flashFireActive = true;
      return { message: `${displayName(defender)} absorbed the flames! Its Fire power rose!` };
    }
    return { message: `${displayName(attacker)} used ${move.name}! It doesn't affect ${displayName(defender)}...` };
  }

  if (move.effect === 'heal') {
    const heal = Math.floor(attacker.maxHp * (move.effectValue ?? 0.5));
    const before = attacker.currentHp;
    attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + heal);
    return { healed: attacker.currentHp - before, message: `${displayName(attacker)} recovered ${attacker.currentHp - before} HP!` };
  }

  if (move.effect === 'boost-atk' || move.effect === 'boost-def' || move.effect === 'boost-spa' || move.effect === 'boost-spd') {
    const statMap: Record<string, StatKey> = {
      'boost-atk': 'atk', 'boost-def': 'def', 'boost-spa': 'spa', 'boost-spd': 'spd',
    };
    const stat = statMap[move.effect];
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
      thunderwave: 'paralyze', hypnosis: 'sleep', confusion: 'confusion', freeze: 'freeze',
    };
    const status = statusMap[move.effect];
    if (status) {
      const msg = applyMoveStatus(defender, status, move.effectChance ?? 100, rng, attacker);
      return { message: msg || `${displayName(attacker)} used ${move.name}! It had no effect.` };
    }
  }

  if (attacker.vol?.flashFireActive && move.type === 'flame') {
    attacker.vol.flashFireActive = false;
  }

  const hits = move.multiHit ? rng.int(move.multiHit[0], move.multiHit[1]) : 1;
  let totalDamage = 0;
  let lastEffectiveness = 1;
  let lastLabel = '';
  let anyCritical = false;
  let sturdyMsg = '';
  let fainted = false;
  let hitsLanded = 0;

  for (let h = 0; h < hits && !fainted; h++) {
    const { damage, effectiveness, label, critical } = calcDamage(attacker, defender, battleMove.id, false, rng);
    if (effectiveness <= 0) {
      return { message: `${displayName(attacker)} used ${move.name}! It doesn't affect ${displayName(defender)}...` };
    }
    let hitDamage = damage;
    if (defender.ability === 'sturdy' && !defender.vol?.sturdyUsed
      && defender.currentHp === defender.maxHp && damage >= defender.currentHp) {
      hitDamage = defender.currentHp - 1;
      defender.vol = defender.vol ?? {};
      defender.vol.sturdyUsed = true;
      sturdyMsg = ` ${displayName(defender)} endured the hit!`;
    }
    defender.currentHp = Math.max(0, defender.currentHp - hitDamage);
    totalDamage += hitDamage;
    lastEffectiveness = effectiveness;
    lastLabel = label;
    anyCritical = anyCritical || critical;
    hitsLanded++;
    fainted = defender.currentHp <= 0;
  }

  let message = `${displayName(attacker)} used ${move.name}!`;
  if (move.multiHit && hitsLanded > 1) message += ` Hit ${hitsLanded} times!`;
  if (anyCritical) message += ' A critical hit!';
  if (lastLabel) message += ` ${lastLabel}`;
  if (sturdyMsg) message += sturdyMsg;

  let healed: number | undefined;
  if (move.drainPct && totalDamage > 0 && attacker.currentHp > 0) {
    const heal = Math.max(1, Math.floor(totalDamage * move.drainPct / 100));
    const before = attacker.currentHp;
    attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + heal);
    healed = attacker.currentHp - before;
    if (healed > 0) message += ` ${displayName(attacker)} drained ${healed} HP!`;
  }

  let attackerFainted = false;
  if (move.recoilPct && totalDamage > 0 && attacker.ability !== 'rock_head') {
    const recoil = Math.max(1, Math.floor(totalDamage * move.recoilPct / 100));
    attacker.currentHp = Math.max(0, attacker.currentHp - recoil);
    message += ` ${displayName(attacker)} was hurt by recoil!`;
    if (attacker.currentHp <= 0) {
      attackerFainted = true;
      message += ` ${displayName(attacker)} fainted!`;
    }
  }

  if (move.effect === 'flinch' && move.effectChance && !fainted) {
    if (defender.ability !== 'inner_focus' && rng.next() * 100 < move.effectChance) {
      defender.vol = defender.vol ?? {};
      defender.vol.flinched = true;
    }
  } else if (move.effect && move.effectChance && !fainted) {
    const statusMap: Record<string, StatusCondition> = {
      burn: 'burn', paralyze: 'paralyze', poison: 'poison', sleep: 'sleep',
      confusion: 'confusion', freeze: 'freeze',
    };
    const status = statusMap[move.effect];
    const statusMsg = status ? applyMoveStatus(defender, status, move.effectChance, rng, attacker) : '';
    if (statusMsg) message += ` ${statusMsg}`;
  }

  if (move.category === 'physical' && !fainted) {
    const contact = contactAbilityEffect(defender.ability, rng);
    if (contact) {
      const msg = applyMoveStatus(attacker, contact, 100, rng);
      if (msg) message += ` ${msg}`;
    }
  }

  if (fainted) message += ` ${displayName(defender)} fainted!`;

  return {
    damage: totalDamage, effectiveness: lastEffectiveness, critical: anyCritical,
    fainted, attackerFainted, healed, message,
  };
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

export function tryCatchWithItem(wild: CritterInstance, itemId: string, rng: Rng = defaultRng): { caught: boolean; shakes: number; message: string } {
  const item = getItem(itemId);
  const def = getCreature(wild.speciesId);
  const hpFactor = (wild.maxHp * 3 - wild.currentHp * 2) / (wild.maxHp * 3);
  const catchValue = hpFactor * (def.catchRate / 255) * (item.catchBonus ?? 1);
  const shakes = catchValue > 0.7 ? 3 : catchValue > 0.4 ? 2 : catchValue > 0.15 ? 1 : 0;
  const caught = rng.chance(Math.min(0.92, catchValue * 1.15 + 0.14));

  let message = `You threw a ${item.name}!`;
  if (caught) message += ' Gotcha! Critter was caught!';
  else if (shakes === 0) message += ' It broke free immediately!';
  else message += ` It shook ${shakes} time${shakes > 1 ? 's' : ''}... and escaped!`;

  return { caught, shakes, message };
}

export function tryRun(playerSpe: number, enemySpe: number, blocked = false, rng: Rng = defaultRng): boolean {
  if (blocked) return false;
  return rng.chance(Math.min(0.95, (playerSpe * 128 / Math.max(1, enemySpe) + 30 * 256) / 256 / 256));
}

export function effectiveSpeed(c: CritterInstance): number {
  return Math.floor(c.stats.spe * speedMultiplier(c));
}

/** Returns which side moves first this turn ('player' | 'enemy').
 * Move priority brackets beat speed; speed breaks ties within a bracket. */
export function resolveTurnOrder(
  playerMon: CritterInstance,
  enemyMon: CritterInstance,
  rng: Rng = defaultRng,
  playerMoveId?: string,
  enemyMoveId?: string,
): 'player' | 'enemy' {
  const playerPrio = playerMoveId ? (getMove(playerMoveId).priority ?? 0) : 0;
  const enemyPrio = enemyMoveId ? (getMove(enemyMoveId).priority ?? 0) : 0;
  if (playerPrio !== enemyPrio) return playerPrio > enemyPrio ? 'player' : 'enemy';
  const playerSpe = effectiveSpeed(playerMon);
  const enemySpe = effectiveSpeed(enemyMon);
  if (playerSpe > enemySpe) return 'player';
  if (enemySpe > playerSpe) return 'enemy';
  return rng.chance(0.5) ? 'player' : 'enemy';
}

export function pickAiMove(enemy: CritterInstance, player: CritterInstance, rng: Rng = defaultRng): number {
  const available = enemy.moves.map((m, i) => ({ i, move: getMove(m.id), pp: m.pp })).filter(m => m.pp > 0);
  if (!available.length) return 0;
  let best = available[0];
  let bestScore = -1;
  for (const cand of available) {
    if (cand.move.power === 0) {
      const score = 5 + rng.next() * 5;
      if (score > bestScore) { bestScore = score; best = cand; }
      continue;
    }
    const { damage, effectiveness } = calcDamage(enemy, player, cand.move.id, false, rng);
    const score = damage * effectiveness + rng.next() * 10;
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
  if (c.heldItem === 'sitrus_berry' && c.currentHp > 0 && c.currentHp <= Math.floor(c.maxHp / 4)) {
    const heal = Math.max(1, Math.floor(c.maxHp / 4));
    c.currentHp = Math.min(c.maxHp, c.currentHp + heal);
    c.heldItem = undefined;
    return `${displayName(c)} ate its Sitrus Berry!`;
  }
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
