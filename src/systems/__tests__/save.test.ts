import { describe, it, expect, beforeEach } from 'vitest';
import { validateSaveData, migrateSaveData, getSaveStatus, saveGame, loadGame, deleteSave } from '../save';
import { GameState } from '../stats';

const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: () => null,
    length: 0,
  } as Storage;
  GameState.reset();
});

describe('validateSaveData', () => {
  it('accepts valid v3 shape', () => {
    expect(validateSaveData({
      name: 'Ash', started: true, mapId: 'town', characterId: 'scout',
      party: [], storage: [], badges: [], dexSeen: [], dexCaught: [],
      defeatedTrainers: [], defeatedRematch: [], storyFlags: {},
    })).toBe(true);
  });

  it('rejects garbage', () => {
    expect(validateSaveData(null)).toBe(false);
    expect(validateSaveData({ name: 42 })).toBe(false);
    expect(validateSaveData([])).toBe(false);
  });
});

describe('migrateSaveData', () => {
  it('migrates legacy captureOrbs field', () => {
    const player = migrateSaveData({
      name: 'Test', started: true, mapId: 'town', characterId: 'scout',
      party: [], storage: [], captureOrbs: 5,
    });
    expect(player.items.capture_orb).toBeGreaterThanOrEqual(5);
  });
});

describe('save roundtrip', () => {
  it('saves and loads valid data', () => {
    GameState.player.name = 'Roundtrip';
    GameState.player.started = true;
    expect(saveGame()).toBe(true);
    GameState.reset();
    expect(loadGame()).toBe(true);
    expect(GameState.player.name).toBe('Roundtrip');
  });

  it('reports corrupt save', () => {
    store['critter-quest-save-v3'] = '{not json';
    expect(getSaveStatus()).toBe('corrupt');
    deleteSave();
    expect(getSaveStatus()).toBe('none');
  });
});
