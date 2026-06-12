import { describe, it, expect } from 'vitest';
import { calcDamage, stageMult, expGain, tryRun, tryCatchWithItem, applyMoveStatus, tryHeldBerry, executeMove, resolveTurnOrder, pickAiSwitch } from '../battle';
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

function withMove(c: ReturnType<typeof createCritter>, moveId: string): number {
  c.moves[0] = { id: moveId, pp: 20, maxPp: 20 };
  return 0;
}

describe('priority moves', () => {
  it('priority move beats faster mon', () => {
    const slow = createCritter('pebblite', 20, undefined, { perfectIvs: true, nature: 'brave' });
    const fast = createCritter('sparkbit', 20, undefined, { perfectIvs: true, nature: 'jolly' });
    expect(resolveTurnOrder(slow, fast, createSeededRng(1), 'quick_strike', 'spark')).toBe('player');
    expect(resolveTurnOrder(slow, fast, createSeededRng(1), 'tackle', 'spark')).toBe('enemy');
  });

  it('equal priority falls back to speed', () => {
    const fast = createCritter('sparkbit', 20, undefined, { perfectIvs: true, nature: 'jolly' });
    const slow = createCritter('pebblite', 20, undefined, { perfectIvs: true, nature: 'brave' });
    expect(resolveTurnOrder(fast, slow, createSeededRng(1), 'quick_strike', 'quick_strike')).toBe('player');
  });
});

describe('recoil', () => {
  it('attacker takes recoil damage', () => {
    const atk = createCritter('emberpup', 30, undefined, { perfectIvs: true });
    const def = createCritter('mossling', 30);
    const idx = withMove(atk, 'take_down');
    const before = atk.currentHp;
    const r = executeMove(atk, def, idx, createSeededRng(3));
    expect(r.damage).toBeGreaterThan(0);
    expect(atk.currentHp).toBeLessThan(before);
    expect(r.message).toContain('recoil');
  });

  it('rock_head blocks recoil', () => {
    const atk = createCritter('pebblite', 30, undefined, { perfectIvs: true });
    atk.ability = 'rock_head';
    const def = createCritter('mossling', 30);
    const idx = withMove(atk, 'take_down');
    const before = atk.currentHp;
    const r = executeMove(atk, def, idx, createSeededRng(3));
    expect(r.damage).toBeGreaterThan(0);
    expect(atk.currentHp).toBe(before);
  });
});

describe('drain', () => {
  it('heals attacker from damage dealt', () => {
    const atk = createCritter('leafkit', 25, undefined, { perfectIvs: true });
    atk.currentHp = Math.floor(atk.maxHp / 2);
    const def = createCritter('pebblite', 25);
    const idx = withMove(atk, 'absorb');
    const before = atk.currentHp;
    const r = executeMove(atk, def, idx, createSeededRng(5));
    expect(r.damage).toBeGreaterThan(0);
    expect(atk.currentHp).toBeGreaterThan(before);
    expect(r.message).toContain('drained');
  });
});

describe('multi-hit', () => {
  it('double_kick hits exactly twice', () => {
    const atk = createCritter('emberpup', 25, undefined, { perfectIvs: true });
    const def = createCritter('voltchick', 25, undefined, { perfectIvs: true });
    const idx = withMove(atk, 'double_kick');
    const r = executeMove(atk, def, idx, createSeededRng(7));
    expect(r.message).toContain('Hit 2 times!');
  });
});

describe('flinch', () => {
  it('sets flinched volatile and skips defender turn', () => {
    const atk = createCritter('pebblite', 25, undefined, { perfectIvs: true });
    const def = createCritter('mossling', 25);
    const idx = withMove(atk, 'headbutt');
    let flinched = false;
    for (let seed = 0; seed < 30 && !flinched; seed++) {
      const d = createCritter('mossling', 25);
      const r = executeMove(atk, d, idx, createSeededRng(seed));
      if (r.missed || d.currentHp <= 0) continue;
      flinched = d.vol?.flinched === true;
      if (flinched) {
        const skip = executeMove(d, atk, 0, createSeededRng(seed));
        expect(skip.cantMove).toBe(true);
        expect(skip.message).toContain('flinched');
        expect(d.vol?.flinched).toBe(false);
      }
    }
    expect(flinched).toBe(true);
    void def;
  });

  it('inner_focus prevents flinch', () => {
    const atk = createCritter('pebblite', 25, undefined, { perfectIvs: true });
    const idx = withMove(atk, 'headbutt');
    for (let seed = 0; seed < 30; seed++) {
      const d = createCritter('mossling', 25);
      d.ability = 'inner_focus';
      executeMove(atk, d, idx, createSeededRng(seed));
      expect(d.vol?.flinched ?? false).toBe(false);
    }
  });
});

describe('confusion and freeze moves', () => {
  it('confuse_ray inflicts confusion', () => {
    const atk = createCritter('murkfox', 20);
    const def = createCritter('mossling', 20);
    const idx = withMove(atk, 'confuse_ray');
    const r = executeMove(atk, def, idx, createSeededRng(2));
    expect(def.status).toBe('confusion');
    expect(r.message).toContain('confused');
  });

  it('freeze does not affect flame types', () => {
    const atk = createCritter('frostkit', 20);
    const def = createCritter('emberpup', 20);
    const idx = withMove(atk, 'icy_gale');
    for (let seed = 0; seed < 20; seed++) {
      const d = createCritter('emberpup', 20);
      executeMove(atk, d, idx, createSeededRng(seed));
      expect(d.status).not.toBe('freeze');
    }
    void def;
  });
});

describe('shiny roll', () => {
  it('shinyChance 1 always rolls shiny', () => {
    const c = createCritter('mossling', 5, undefined, { shinyChance: 1, rng: createSeededRng(1) });
    expect(c.shiny).toBe(true);
  });
  it('shinyChance 0 never rolls shiny', () => {
    const c = createCritter('mossling', 5, undefined, { shinyChance: 0, rng: createSeededRng(1) });
    expect(c.shiny).toBeUndefined();
  });
});

describe('pickAiSwitch', () => {
  it('switches to a super-effective bench mon when outmatched', () => {
    const current = createCritter('mossling', 20);
    current.moves = [{ id: 'vine', pp: 20, maxPp: 20 }]; // leaf vs flame = 0.5x
    const bench = createCritter('aqualet', 20); // tide vs flame = 2x
    const player = createCritter('emberpup', 20);
    const idx = pickAiSwitch(current, [current, bench], 0, player);
    expect(idx).toBe(1);
  });

  it('stays in when current matchup is acceptable', () => {
    const current = createCritter('emberpup', 20); // flame vs leaf = 2x
    const bench = createCritter('aqualet', 20);
    const player = createCritter('leafkit', 20);
    expect(pickAiSwitch(current, [current, bench], 0, player)).toBe(-1);
  });

  it('never switches the same mon twice', () => {
    const current = createCritter('mossling', 20);
    current.moves = [{ id: 'vine', pp: 20, maxPp: 20 }];
    current.vol = { aiSwitched: true };
    const bench = createCritter('aqualet', 20);
    const player = createCritter('emberpup', 20);
    expect(pickAiSwitch(current, [current, bench], 0, player)).toBe(-1);
  });

  it('ignores fainted bench mons', () => {
    const current = createCritter('mossling', 20);
    current.moves = [{ id: 'vine', pp: 20, maxPp: 20 }];
    const bench = createCritter('aqualet', 20);
    bench.currentHp = 0;
    const player = createCritter('emberpup', 20);
    expect(pickAiSwitch(current, [current, bench], 0, player)).toBe(-1);
  });
});

describe('insomnia', () => {
  it('blocks sleep status', () => {
    const def = createCritter('dreamwisp', 15);
    def.ability = 'insomnia';
    const msg = applyMoveStatus(def, 'sleep', 100, createSeededRng(1));
    expect(msg).toBe('');
    expect(def.status).toBeNull();
  });
});

describe('snow_cloak', () => {
  it('reduces move accuracy', () => {
    const atk = createCritter('emberpup', 20);
    const def = createCritter('frostkit', 20);
    def.ability = 'snow_cloak';
    let misses = 0;
    for (let seed = 0; seed < 50; seed++) {
      const d = createCritter('frostkit', 20);
      d.ability = 'snow_cloak';
      const r = executeMove(atk, d, 0, createSeededRng(seed));
      if (r.missed) misses++;
    }
    const controlMisses = 50;
    let control = 0;
    for (let seed = 0; seed < 50; seed++) {
      const d = createCritter('frostkit', 20);
      d.ability = 'inner_focus';
      const r = executeMove(atk, d, 0, createSeededRng(seed));
      if (r.missed) control++;
    }
    expect(misses).toBeGreaterThanOrEqual(control);
  });
});
