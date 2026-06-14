import { describe, it, expect, afterEach } from 'vitest';
import {
  setBattleWeather, getBattleWeather, weatherDamageMult, weatherSpeedMult,
  applyHailChip, weatherLabel,
} from '../weather';
import { calcDamage, effectiveSpeed } from '../battle';
import { createCritter } from '../stats';
import { createSeededRng } from '../rng';

afterEach(() => setBattleWeather(null));

describe('weatherDamageMult', () => {
  it('rain boosts tide and weakens flame', () => {
    expect(weatherDamageMult('rain', 'tide')).toBe(1.3);
    expect(weatherDamageMult('rain', 'flame')).toBe(0.7);
    expect(weatherDamageMult('rain', 'leaf')).toBe(1);
  });
  it('sun boosts flame and weakens tide', () => {
    expect(weatherDamageMult('sun', 'flame')).toBe(1.3);
    expect(weatherDamageMult('sun', 'tide')).toBe(0.7);
  });
  it('no weather is neutral', () => {
    expect(weatherDamageMult(null, 'flame')).toBe(1);
  });
});

describe('weather in damage calc', () => {
  it('sun increases flame damage', () => {
    const atk = createCritter('emberpup', 30, undefined, { perfectIvs: true, nature: 'modest' });
    const def = createCritter('pebblite', 30, undefined, { perfectIvs: true, nature: 'bold' });
    setBattleWeather(null);
    const neutral = calcDamage(atk, def, 'ember', true, createSeededRng(9)).damage;
    setBattleWeather('sun');
    const sunny = calcDamage(atk, def, 'ember', true, createSeededRng(9)).damage;
    expect(sunny).toBeGreaterThan(neutral);
  });
});

describe('weather speed abilities', () => {
  it('chlorophyll doubles speed in sun only', () => {
    const c = createCritter('mossling', 20, undefined, { perfectIvs: true });
    c.ability = 'chlorophyll';
    setBattleWeather(null);
    const base = effectiveSpeed(c);
    setBattleWeather('sun');
    expect(effectiveSpeed(c)).toBe(base * 2);
    setBattleWeather('rain');
    expect(effectiveSpeed(c)).toBe(base);
  });
  it('swift_swim doubles speed in rain', () => {
    expect(weatherSpeedMult('rain', 'swift_swim')).toBe(2);
    expect(weatherSpeedMult('sun', 'swift_swim')).toBe(1);
  });
});

describe('hail chip', () => {
  it('damages non-ice critters in hail', () => {
    setBattleWeather('hail');
    const c = createCritter('mossling', 20);
    const before = c.currentHp;
    const msg = applyHailChip(c);
    expect(msg).toContain('hail');
    expect(c.currentHp).toBeLessThan(before);
  });
  it('skips ice types', () => {
    setBattleWeather('hail');
    const c = createCritter('frostkit', 20);
    expect(applyHailChip(c)).toBeNull();
  });
  it('does nothing without hail', () => {
    setBattleWeather('rain');
    const c = createCritter('mossling', 20);
    expect(applyHailChip(c)).toBeNull();
  });
});

describe('weather state', () => {
  it('set/get roundtrip and labels', () => {
    setBattleWeather('rain');
    expect(getBattleWeather()).toBe('rain');
    expect(weatherLabel('rain')).toContain('Rain');
    expect(weatherLabel(null)).toBe('');
  });
});

describe('map weather (overworld WeatherLayer)', () => {
  it('weather maps assigned for VFX', async () => {
    const { getMap } = await import('../../data/maps');
    expect(getMap('route3').weather).toBe('rain');
    expect(getMap('glacier_pass').weather).toBe('hail');
    expect(getMap('volcanic_path').weather).toBe('sun');
    expect(getMap('town').weather).toBeUndefined();
  });
});
