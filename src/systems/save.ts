import { GameState, defaultPlayer, type PlayerState, type CritterInstance, migrateCritter } from './stats';
import { emptyBag } from '../data/items';

const SAVE_KEY = 'critter-quest-save-v3';
const LEGACY_KEYS = ['critter-quest-save-v2', 'critter-quest-save'] as const;

export type SaveStatus = 'none' | 'valid' | 'corrupt';

function findSaveRaw(): string | null {
  return localStorage.getItem(SAVE_KEY)
    ?? localStorage.getItem(LEGACY_KEYS[0])
    ?? localStorage.getItem(LEGACY_KEYS[1]);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(x => typeof x === 'string');
}

function isRecord(v: unknown): v is Record<string, boolean> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Whitelist + type-check parsed save payload before migration. */
export function validateSaveData(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.name !== 'string') return false;
  if (typeof d.started !== 'boolean') return false;
  if (typeof d.mapId !== 'string') return false;
  if (typeof d.characterId !== 'string') return false;
  if (!Array.isArray(d.party)) return false;
  if (!Array.isArray(d.storage)) return false;
  if (!isStringArray(d.badges ?? [])) return false;
  if (!isStringArray(d.dexSeen ?? [])) return false;
  if (!isStringArray(d.dexCaught ?? [])) return false;
  if (!isStringArray(d.defeatedTrainers ?? [])) return false;
  if (!isStringArray(d.defeatedRematch ?? [])) return false;
  if (d.storyFlags !== undefined && !isRecord(d.storyFlags)) return false;
  if (d.items !== undefined && (typeof d.items !== 'object' || d.items === null || Array.isArray(d.items))) return false;
  return true;
}

function migrate(data: Record<string, unknown>): PlayerState {
  const base = defaultPlayer();
  const items = { ...emptyBag(), ...(typeof data.items === 'object' && data.items && !Array.isArray(data.items) ? data.items as PlayerState['items'] : {}) };
  if (typeof data.captureOrbs === 'number') {
    items.capture_orb = (items.capture_orb ?? 0) + data.captureOrbs;
  }

  const player: PlayerState = {
    ...base,
    name: typeof data.name === 'string' ? data.name : base.name,
    characterId: typeof data.characterId === 'string' ? data.characterId : base.characterId,
    x: typeof data.x === 'number' ? data.x : base.x,
    y: typeof data.y === 'number' ? data.y : base.y,
    mapId: typeof data.mapId === 'string' ? data.mapId : base.mapId,
    facing: data.facing === 'up' || data.facing === 'down' || data.facing === 'left' || data.facing === 'right' ? data.facing : base.facing,
    money: typeof data.money === 'number' ? data.money : base.money,
    starterId: typeof data.starterId === 'string' ? data.starterId : base.starterId,
    playTime: typeof data.playTime === 'number' ? data.playTime : base.playTime,
    started: typeof data.started === 'boolean' ? data.started : base.started,
    items,
    badges: isStringArray(data.badges) ? data.badges : [],
    dexSeen: isStringArray(data.dexSeen) ? data.dexSeen : [],
    dexCaught: isStringArray(data.dexCaught) ? data.dexCaught : [],
    storyFlags: isRecord(data.storyFlags) ? data.storyFlags : {},
    defeatedTrainers: isStringArray(data.defeatedTrainers) ? data.defeatedTrainers : [],
    defeatedRematch: isStringArray(data.defeatedRematch) ? data.defeatedRematch : [],
    storage: Array.isArray(data.storage) ? data.storage as CritterInstance[] : [],
    party: Array.isArray(data.party) ? data.party as CritterInstance[] : [],
  };

  player.party = (player.party ?? []).map(migrateCritter);
  player.storage = (player.storage ?? []).map(migrateCritter);
  return player;
}

export function getSaveStatus(): SaveStatus {
  const raw = findSaveRaw();
  if (!raw) return 'none';
  try {
    const parsed = JSON.parse(raw) as unknown;
    return validateSaveData(parsed) ? 'valid' : 'corrupt';
  } catch {
    return 'corrupt';
  }
}

/** @returns true if save written successfully */
export function saveGame(): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(GameState.player));
    for (const k of LEGACY_KEYS) localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadGame(): boolean {
  const raw = findSaveRaw();
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!validateSaveData(parsed)) return false;
    GameState.player = migrate(parsed);
    return GameState.player.started;
  } catch {
    return false;
  }
}

export function hasSave(): boolean {
  return getSaveStatus() === 'valid';
}

export function deleteSave(): void {
  [SAVE_KEY, ...LEGACY_KEYS].forEach(k => localStorage.removeItem(k));
}

export function addToParty(critter: CritterInstance): boolean {
  if (GameState.player.party.length < 6) {
    GameState.player.party.push(critter);
    return true;
  }
  GameState.player.storage.push(critter);
  return false;
}

export function depositToStorage(index: number): boolean {
  if (GameState.player.party.length <= 1) return false;
  const c = GameState.player.party[index];
  if (!c) return false;
  GameState.player.party.splice(index, 1);
  GameState.player.storage.push(c);
  return true;
}

export function withdrawFromStorage(index: number): boolean {
  if (GameState.player.party.length >= 6) return false;
  const c = GameState.player.storage[index];
  if (!c) return false;
  GameState.player.storage.splice(index, 1);
  GameState.player.party.push(c);
  return true;
}
