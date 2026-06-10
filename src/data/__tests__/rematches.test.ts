import { describe, expect, it } from 'vitest';
import { CREATURES } from '../creatures';
import { REMATCH_ROSTERS, resolveRematch, rematchRosterCount } from '../rematches';

describe('rematches', () => {
  it('has post-champion rosters for major trainers', () => {
    expect(rematchRosterCount()).toBeGreaterThanOrEqual(35);
    for (const id of ['rival', 'gym_leader', 'gym_leader_sage', 'champion', 'elite_trainer1']) {
      expect(REMATCH_ROSTERS[id]).toBeDefined();
    }
  });

  it('resolveRematch prefers inline override', () => {
    const inline = { party: [{ creatureId: 'mossling', level: 50 }], reward: 999 };
    expect(resolveRematch('hiker', inline)).toEqual(inline);
    expect(resolveRematch('hiker')).toEqual(REMATCH_ROSTERS.hiker);
  });

  it('uses valid species ids (except rival tokens)', () => {
    const ids = new Set(Object.keys(CREATURES));
    for (const def of Object.values(REMATCH_ROSTERS)) {
      for (const mon of def.party) {
        if (mon.creatureId.startsWith('__RIVAL')) continue;
        expect(ids.has(mon.creatureId), mon.creatureId).toBe(true);
      }
    }
  });
});
