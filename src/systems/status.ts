import type { CritterInstance } from './stats';

export type StatusCondition = 'burn' | 'paralyze' | 'poison' | 'sleep' | 'freeze' | 'confusion' | null;

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

export function canAct(c: CritterInstance): { ok: boolean; message?: string } {
  const name = c.nickname ?? c.speciesId;
  if (c.status === 'freeze') {
    if (Math.random() < 0.2) {
      c.status = null;
      return { ok: true, message: `${name} thawed out!` };
    }
    return { ok: false, message: `${name} is frozen solid!` };
  }
  if (c.status === 'sleep') {
    if ((c.statusTurns ?? 0) > 0) {
      c.statusTurns = (c.statusTurns ?? 1) - 1;
      if (c.statusTurns <= 0) {
        c.status = null;
        return { ok: true, message: `${name} woke up!` };
      }
      return { ok: false, message: `${name} is fast asleep!` };
    }
  }
  if (c.status === 'confusion') {
    if (Math.random() < 0.33) {
      const dmg = Math.max(1, Math.floor(c.maxHp / 16));
      c.currentHp = Math.max(0, c.currentHp - dmg);
      return { ok: false, message: `${name} hurt itself in confusion!` };
    }
    if ((c.statusTurns ?? 0) > 0) c.statusTurns = (c.statusTurns ?? 1) - 1;
    if ((c.statusTurns ?? 0) <= 0) c.status = null;
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
  if (status === 'freeze' && c.status === 'burn') return false;
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
