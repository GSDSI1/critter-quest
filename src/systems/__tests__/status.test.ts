import { describe, it, expect } from 'vitest';
import { canAct, applyStatus, applyEndOfTurnStatus, attackMultiplier, speedMultiplier, clearStatus } from '../status';
import { createCritter } from '../stats';
import { createSeededRng } from '../rng';

describe('status multipliers', () => {
  it('burn halves attack', () => {
    const c = createCritter('emberpup', 10);
    c.status = 'burn';
    expect(attackMultiplier(c)).toBe(0.5);
  });

  it('paralyze halves speed', () => {
    const c = createCritter('emberpup', 10);
    c.status = 'paralyze';
    expect(speedMultiplier(c)).toBe(0.5);
  });
});

describe('applyStatus', () => {
  it('applies sleep with turns', () => {
    const c = createCritter('leafkit', 10);
    expect(applyStatus(c, 'sleep', 3)).toBe(true);
    expect(c.status).toBe('sleep');
    expect(c.statusTurns).toBe(3);
  });

  it('does not overwrite existing status', () => {
    const c = createCritter('leafkit', 10);
    c.status = 'burn';
    expect(applyStatus(c, 'sleep', 2)).toBe(false);
  });
});

describe('canAct', () => {
  it('blocks frozen critter with seeded rng', () => {
    const c = createCritter('aqualet', 10);
    c.status = 'freeze';
    const rng = createSeededRng(1);
    const result = canAct(c, rng);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('frozen');
  });

  it('wakes sleeping critter after turns', () => {
    const c = createCritter('mossling', 10);
    c.status = 'sleep';
    c.statusTurns = 1;
    const result = canAct(c, createSeededRng(99));
    expect(result.ok).toBe(true);
    expect(c.status).toBeNull();
  });
});

describe('applyEndOfTurnStatus', () => {
  it('burn chips hp', () => {
    const c = createCritter('emberpup', 20);
    c.status = 'burn';
    const hp = c.currentHp;
    applyEndOfTurnStatus(c);
    expect(c.currentHp).toBeLessThan(hp);
  });

  it('clearStatus resets', () => {
    const c = createCritter('emberpup', 10);
    applyStatus(c, 'poison', 0);
    clearStatus(c);
    expect(c.status).toBeNull();
  });
});
