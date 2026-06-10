import { describe, it, expect } from 'vitest';
import { expForLevel, levelFromExp, expProgress, createCritter, addExp } from '../stats';
import { natureMult } from '../../data/natures';

describe('exp curves', () => {
  it('expForLevel follows cubic curve', () => {
    expect(expForLevel(1)).toBe(1);
    expect(expForLevel(10)).toBe(1000);
  });

  it('levelFromExp inverts expForLevel', () => {
    expect(levelFromExp(expForLevel(15))).toBe(15);
  });

  it('expProgress is between 0 and 1', () => {
    const c = createCritter('emberpup', 5, undefined, { nature: 'hardy', ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 } });
    expect(expProgress(c)).toBeGreaterThanOrEqual(0);
    expect(expProgress(c)).toBeLessThanOrEqual(1);
  });
});

describe('stat math', () => {
  it('adamant boosts atk and lowers spa', () => {
    expect(natureMult('adamant', 'atk')).toBe(1.1);
    expect(natureMult('adamant', 'spa')).toBe(0.9);
  });

  it('createCritter computes positive stats', () => {
    const c = createCritter('emberpup', 10, undefined, { perfectIvs: true, nature: 'hardy' });
    expect(c.maxHp).toBeGreaterThan(0);
    expect(c.stats.atk).toBeGreaterThan(0);
    expect(c.currentHp).toBe(c.maxHp);
  });

  it('addExp levels up when enough exp', () => {
    const c = createCritter('mossling', 5, undefined, { nature: 'hardy', ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 } });
    const results = addExp(c, 5000);
    expect(results.some(r => r.leveledUp)).toBe(true);
    expect(c.level).toBeGreaterThan(5);
  });
});
