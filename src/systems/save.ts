import { GameState, defaultPlayer, type PlayerState, type CritterInstance, migrateCritter } from './stats';
import { emptyBag } from '../data/items';

const SAVE_KEY = 'critter-quest-save-v3';

export function saveGame(): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(GameState.player));
    localStorage.removeItem('critter-quest-save-v2');
    localStorage.removeItem('critter-quest-save');
  } catch { /* ignore */ }
}

function migrate(data: Record<string, unknown>): PlayerState {
  const base = defaultPlayer();
  const items = { ...emptyBag(), ...(data.items as PlayerState['items'] ?? {}) };
  if (typeof data.captureOrbs === 'number') {
    items.capture_orb = (items.capture_orb ?? 0) + (data.captureOrbs as number);
  }
  const player: PlayerState = {
    ...base,
    ...(data as Partial<PlayerState>),
    items,
    badges: (data.badges as string[]) ?? [],
    dexSeen: (data.dexSeen as string[]) ?? [],
    dexCaught: (data.dexCaught as string[]) ?? [],
    starterId: (data.starterId as string) ?? '',
    characterId: (data.characterId as string) ?? 'scout',
    storyFlags: (data.storyFlags as Record<string, boolean>) ?? {},
    storage: (data.storage as CritterInstance[]) ?? [],
    defeatedRematch: (data.defeatedRematch as string[]) ?? [],
  };
  player.party = (player.party ?? []).map(migrateCritter);
  player.storage = (player.storage ?? []).map(migrateCritter);
  return player;
}

export function loadGame(): boolean {
  try {
    let raw = localStorage.getItem(SAVE_KEY)
      ?? localStorage.getItem('critter-quest-save-v2')
      ?? localStorage.getItem('critter-quest-save');
    if (!raw) return false;
    GameState.player = migrate(JSON.parse(raw) as Record<string, unknown>);
    return GameState.player.started;
  } catch {
    return false;
  }
}

export function hasSave(): boolean {
  return ['critter-quest-save-v3', 'critter-quest-save-v2', 'critter-quest-save']
    .some(k => localStorage.getItem(k) !== null);
}

export function deleteSave(): void {
  ['critter-quest-save-v3', 'critter-quest-save-v2', 'critter-quest-save'].forEach(k => localStorage.removeItem(k));
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
