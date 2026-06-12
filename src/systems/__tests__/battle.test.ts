import { describe, it, expect } from 'vitest';
import { calcDamage, stageMult, expGain, tryRun, tryCatchWithItem, applyMoveStatus, tryHeldBerry, executeMove, resolveTurnOrder } from '../battle';
import { createCritter } from '../stats';
import { createSeededRng } from '../rng';
import { typeMultiplier } from '../../data/types';
import { getMove } from '../../data/moves';

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

describe('resolveTurnOrder', () => {
  it('faster mon moves first', () => {
    const fast = createCritter('sparkbit', 20, undefined, { perfectIvs: true, nature: 'jolly' });
    const slow = createCritter('pebblite', 20, undefined, { perfectIvs: true, nature: 'brave' });
    expect(resolveTurnOrder(fast, slow, createSeededRng(1))).toBe('player');
    expect(resolveTurnOrder(slow, fast, createSeededRng(1))).toBe('enemy');
  });

  it('breaks speed ties with rng', () => {
    const a = createCritter('mossling', 10);
    const b = createCritter('mossling', 10);
    const order = resolveTurnOrder(a, b, createSeededRng(42));
    expect(['player', 'enemy']).toContain(order);
  });
});

describe('calm_mind', () => {
  it('raises Sp. Atk not Attack', () => {
    const mon = createCritter('psychomyst', 20);
    const foe = createCritter('mossling', 20);
    const moveIdx = mon.moves.findIndex(m => m.id === 'calm_mind');
    if (moveIdx < 0) {
      mon.moves[0] = { id: 'calm_mind', pp: 20, maxPp: 20 };
    }
    const idx = moveIdx >= 0 ? moveIdx : 0;
    const beforeAtk = mon.statStages.atk;
    const beforeSpa = mon.statStages.spa;
    executeMove(mon, foe, idx, createSeededRng(1));
    expect(mon.statStages.spa).toBeGreaterThan(beforeSpa);
    expect(mon.statStages.atk).toBe(beforeAtk);
  });
});

describe('sturdy', () => {
  it('survives OHKO from full HP once', () => {
    const atk = createCritter('emberlord', 50, undefined, { perfectIvs: true, nature: 'modest' });
    const def = createCritter('pebblite', 50);
    def.ability = 'sturdy';
    def.currentHp = def.maxHp;
    const moveIdx = atk.moves.findIndex(m => getMove(m.id).power > 0);
    const result = executeMove(atk, def, moveIdx >= 0 ? moveIdx : 0, createSeededRng(7));
    expect(def.currentHp).toBe(1);
    expect(result.message).toContain('endured');
  });
});

describe('thick_fat', () => {
  it('halves flame damage', () => {
    const atk = createCritter('emberpup', 30, undefined, { perfectIvs: true, nature: 'modest' });
    const def = createCritter('mossling', 30);
    def.ability = 'thick_fat';
    const rng = createSeededRng(55);
    const normal = calcDamage(atk, { ...def, ability: 'inner_focus' }, 'ember', true, rng);
    const thick = calcDamage(atk, def, 'ember', true, createSeededRng(55));
    expect(thick.damage).toBeLessThanOrEqual(Math.ceil(normal.damage / 2));
  });
});

describe('flash_fire', () => {
  it('absorbs flame and boosts next fire move', () => {
    const atk = createCritter('emberpup', 20);
    const def = createCritter('cinderkit', 20);
    def.ability = 'flash_fire';
    const emberIdx = atk.moves.findIndex(m => m.id === 'ember');
    const absorb = executeMove(atk, def, emberIdx >= 0 ? emberIdx : 0, createSeededRng(1));
    expect(absorb.message).toContain('absorbed the flames');
    expect(def.vol?.flashFireActive).toBe(true);
  });
});

describe('synchronize', () => {
  it('passes burn to attacker', () => {
    const atk = createCritter('leafkit', 15);
    const def = createCritter('psychomyst', 15);
    def.ability = 'synchronize';
    const msg = applyMoveStatus(def, 'burn', 100, createSeededRng(1), atk);
    expect(msg).toContain('synchronized');
    expect(atk.status).toBe('burn');
  });
});
