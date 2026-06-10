import type { CritterInstance } from './stats';

export type StatusCondition = 'burn' | 'paralyze' | 'poison' | 'sleep' | 'freeze' | 'confusion' | null;

/** Confusion self-hit: ~maxHp/16 (typeless physical chip, classic games use ~40 BP). */
export const CONFUSION_SELF_DAMAGE_DIVISOR = 16;

export interface ActCheckResult {
  ok: boolean;
  message?: string;
  /** Damage dealt to self (confusion). */
  selfDamage?: number;
  /** Attacker fainted from self-inflicted damage before acting. */
  attackerFainted?: boolean;
}

export function statusLabel(s: StatusCondition): string {
  switch (s) {
    case 'burn': return 'BRN';
    case 'paralyze': return 'PAR';
    case 'poison': return 'PSN';
    case 'sleep': return 'SLP';
    case 'freeze': return 'FRZ';
    case 'confusion': return 'CNF';
    default: return '';
  }
}

export function canAct(c: CritterInstance): ActCheckResult {
  const name = c.nickname ?? c.speciesId;
  if (c.status === 'freeze') {
    if (Math.random() < 0.2) {
      c.status = null;
      return { ok: true, message: `${name} thawed out!` };
    }
    return { ok: false, message: `${name} is frozen solid!` };
  }
  if (c.status === 'sleep') {
    const turnsLeft = c.statusTurns ?? 1;
    c.statusTurns = turnsLeft - 1;
    if (c.statusTurns <= 0) {
      c.status = null;
      c.statusTurns = 0;
      return { ok: true, message: `${name} woke up!` };
    }
    return { ok: false, message: `${name} is fast asleep!` };
  }
  if (c.status === 'confusion') {
    if (Math.random() < 0.33) {
      const dmg = Math.max(1, Math.floor(c.maxHp / CONFUSION_SELF_DAMAGE_DIVISOR));
      c.currentHp = Math.max(0, c.currentHp - dmg);
      const attackerFainted = c.currentHp <= 0;
      return {
        ok: false,
        message: `${name} hurt itself in confusion!`,
        selfDamage: dmg,
        attackerFainted,
      };
    }
    const turnsLeft = c.statusTurns ?? 1;
    c.statusTurns = turnsLeft - 1;
    if (c.statusTurns <= 0) {
      c.status = null;
      c.statusTurns = 0;
    }
  }
  if (c.status === 'paralyze' && Math.random() < 0.25) {
    return { ok: false, message: `${name} is paralyzed! It can't move!` };
  }
  return { ok: true };
}

export function applyEndOfTurnStatus(c: CritterInstance): string | null {
  if (c.currentHp <= 0) return null;
  const name = c.nickname ?? c.speciesId;
  if (c.status === 'burn') {
    const dmg = Math.max(1, Math.floor(c.maxHp / 16));
    c.currentHp = Math.max(0, c.currentHp - dmg);
    return `${name} is hurt by its burn!`;
  }
  if (c.status === 'poison') {
    const dmg = Math.max(1, Math.floor(c.maxHp / 8));
    c.currentHp = Math.max(0, c.currentHp - dmg);
    return `${name} is hurt by poison!`;
  }
  return null;
}

export function applyStatus(c: CritterInstance, status: StatusCondition, turns = 3): boolean {
  if (c.status || !status) return false;
  c.status = status;
  if (status === 'sleep' || status === 'confusion') c.statusTurns = turns;
  return true;
}

export function clearStatus(c: CritterInstance): void {
  c.status = null;
  c.statusTurns = 0;
}

export function speedMultiplier(c: CritterInstance): number {
  return c.status === 'paralyze' ? 0.5 : 1;
}

export function attackMultiplier(c: CritterInstance): number {
  return c.status === 'burn' ? 0.5 : 1;
}
