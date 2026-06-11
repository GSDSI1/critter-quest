import { describe, it, expect } from 'vitest';
import { calcDamage, stageMult, expGain, tryRun, tryCatchWithItem, applyMoveStatus, tryHeldBerry } from '../battle';
import { createCritter } from '../stats';
import { createSeededRng } from '../rng';
import { typeMultiplier } from '../../data/types';

describe('stageMult', () => {
  it('applies positive and negative stages', () => {
    expect(stageMult(0)).toBe(1);
    expect(stageMult(2)).toBe(2);
    expect(stageMult(-2)).toBe(0.5);
  });
});

describe('type effectiveness', () => {
  it('flame is super effective vs leaf', () => {
    expect(typeMultiplier('flame', 'leaf')).toBe(2);
  });
  it('flame is not very effective vs tide', () => {
    expect(typeMultiplier('flame', 'tide')).toBe(0.5);
  });
});

describe('calcDamage', () => {
  it('returns zero damage for status moves', () => {
    const atk = createCritter('emberpup', 10, undefined, { nature: 'hardy', ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 } });
    const def = createCritter('leafkit', 10, undefined, { nature: 'hardy', ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 } });
    const result = calcDamage(atk, def, 'growl', true, createSeededRng(42));
    expect(result.damage).toBe(0);
  });

  it('is deterministic with seeded rng and forceCrit', () => {
    const atk = createCritter('emberpup', 20, undefined, { perfectIvs: true, nature: 'adamant' });
    const def = createCritter('leafkit', 20, undefined, { perfectIvs: true, nature: 'bold' });
    const rng = createSeededRng(12345);
    const a = calcDamage(atk, def, 'ember', true, rng);
    const b = calcDamage(atk, def, 'ember', true, createSeededRng(12345));
    expect(a.damage).toBe(b.damage);
    expect(a.critical).toBe(true);
    expect(a.effectiveness).toBe(2);
  });
});

describe('tryRun', () => {
  it('never runs when blocked', () => {
    expect(tryRun(100, 10, true, createSeededRng(1))).toBe(false);
  });
});

describe('tryCatchWithItem', () => {
  it('returns structured result', () => {
    const wild = createCritter('mossling', 5);
    wild.currentHp = 1;
    const result = tryCatchWithItem(wild, 'capture_orb', createSeededRng(99));
    expect(result).toHaveProperty('caught');
    expect(result).toHaveProperty('shakes');
    expect(result.message).toContain('Capture Orb');
  });
});

describe('expGain', () => {
  it('awards more exp for trainer battles', () => {
    const c = createCritter('mossling', 10);
    expect(expGain(c, false)).toBeGreaterThan(expGain(c, true));
  });
});

describe('lum berry', () => {
  it('cures inflicted status and is consumed', () => {
    const def = createCritter('mossling', 10);
    def.heldItem = 'lum_berry';
    const msg = applyMoveStatus(def, 'poison', 100, createSeededRng(1));
    expect(msg).toContain('Lum Berry');
    expect(def.status).toBeNull();
    expect(def.heldItem).toBeUndefined();
  });
});

describe('sitrus berry', () => {
  it('heals at or below 25% HP and is consumed', () => {
    const c = createCritter('mossling', 10);
    c.heldItem = 'sitrus_berry';
    c.currentHp = Math.floor(c.maxHp / 4);
    const before = c.currentHp;
    const msg = tryHeldBerry(c);
    expect(msg).toContain('Sitrus Berry');
    expect(c.currentHp).toBeGreaterThan(before);
    expect(c.heldItem).toBeUndefined();
  });

  it('does not trigger above 25% HP', () => {
    const c = createCritter('mossling', 10);
    c.heldItem = 'sitrus_berry';
    c.currentHp = Math.floor(c.maxHp / 4) + 1;
    expect(tryHeldBerry(c)).toBeNull();
    expect(c.heldItem).toBe('sitrus_berry');
  });
});
