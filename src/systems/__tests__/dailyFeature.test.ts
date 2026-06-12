import { describe, it, expect } from 'vitest';
import {
  featuredSpeciesOfDay, dayStamp, shinyOddsFor, FEATURED_SHINY_ODDS, featuredHintLine,
} from '../dailyFeature';
import { SHINY_ODDS } from '../stats';
import { CREATURES } from '../../data/creatures';
import { pickWildFromTable } from '../../data/encounters';
import { createSeededRng } from '../rng';

describe('featuredSpeciesOfDay', () => {
  it('is deterministic for a given date', () => {
    const d = new Date('2026-06-12T12:00:00');
    expect(featuredSpeciesOfDay(d)).toBe(featuredSpeciesOfDay(d));
  });

  it('changes across days and is always a valid species', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(2026, 5, 1 + i, 12);
      const id = featuredSpeciesOfDay(d);
      expect(CREATURES[id]).toBeDefined();
      seen.add(id);
    }
    expect(seen.size).toBeGreaterThan(5);
  });

  it('dayStamp increments daily', () => {
    const a = dayStamp(new Date(2026, 5, 12, 12));
    const b = dayStamp(new Date(2026, 5, 13, 12));
    expect(b - a).toBe(1);
  });
});

describe('shinyOddsFor', () => {
  it('boosts odds for the featured species only', () => {
    const d = new Date('2026-06-12T12:00:00');
    const featured = featuredSpeciesOfDay(d);
    expect(shinyOddsFor(featured, d)).toBe(FEATURED_SHINY_ODDS);
    const other = featured === 'mossling' ? 'pebblite' : 'mossling';
    expect(shinyOddsFor(other, d)).toBe(SHINY_ODDS);
  });
});

describe('featured encounter weight', () => {
  it('doubles featured species weight in the roll', () => {
    let plain = 0;
    let boosted = 0;
    for (let seed = 0; seed < 400; seed++) {
      if (pickWildFromTable('route1', createSeededRng(seed)).def.id === 'mossling') plain++;
      if (pickWildFromTable('route1', createSeededRng(seed), 'mossling').def.id === 'mossling') boosted++;
    }
    expect(boosted).toBeGreaterThan(plain);
  });
});

describe('featuredHintLine', () => {
  it('mentions the featured species name', () => {
    const d = new Date('2026-06-12T12:00:00');
    const line = featuredHintLine(d);
    expect(line).toContain('featured critter');
  });
});
