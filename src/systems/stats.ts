import { getCreature } from '../data/creatures';
import { getMove } from '../data/moves';
import { movesKnownAtLevel } from '../data/learnsets';
import { emptyBag, addItem, type ItemBag } from '../data/items';
import { defaultAbilityForTypes } from '../data/abilities';
import { randomNature, randomIvs, natureMult } from '../data/natures';
import type { ElementType } from '../data/types';
import type { StatusCondition } from './status';
import { clearStatus } from './status';

export interface BattleMove {
  id: string;
  pp: number;
  maxPp: number;
}

export interface CritterIvs {
  hp: number; atk: number; def: number; spa: number; spd: number; spe: number;
}

export interface CritterInstance {
  uid: string;
  speciesId: string;
  nickname?: string;
  level: number;
  exp: number;
  currentHp: number;
  maxHp: number;
  stats: { atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: CritterIvs;
  nature: string;
  ability: string;
  heldItem?: string;
  moves: BattleMove[];
  statStages: { atk: number; def: number; spa: number; spd: number; spe: number };
  status: StatusCondition;
  statusTurns?: number;
}

export interface PlayerState {
  name: string;
  characterId: string;
  x: number;
  y: number;
  mapId: string;
  facing: 'up' | 'down' | 'left' | 'right';
  party: CritterInstance[];
  storage: CritterInstance[];
  money: number;
  items: ItemBag;
  badges: string[];
  dexSeen: string[];
  dexCaught: string[];
  starterId: string;
  storyFlags: Record<string, boolean>;
  defeatedTrainers: string[];
  defeatedRematch: string[];
  playTime: number;
  started: boolean;
}

let uidCounter = 0;
export function nextUid(): string {
  return `c_${Date.now()}_${++uidCounter}`;
}

export function expForLevel(level: number): number {
  return Math.floor(level ** 3);
}

export function expProgress(c: CritterInstance): number {
  if (c.level >= 100) return 1;
  const cur = c.exp - expForLevel(c.level);
  const need = expForLevel(c.level + 1) - expForLevel(c.level);
  return need > 0 ? cur / need : 0;
}

export function levelFromExp(exp: number): number {
  let lvl = 1;
  while (expForLevel(lvl + 1) <= exp && lvl < 100) lvl++;
  return lvl;
}

function calcStat(base: number, iv: number, level: number, natureId: string, stat: keyof CritterIvs): number {
  if (stat === 'hp') return Math.floor((2 * base + iv) * level / 100 + level + 10);
  return Math.floor((Math.floor((2 * base + iv) * level / 100) + 5) * natureMult(natureId, stat as 'atk' | 'def' | 'spa' | 'spd' | 'spe'));
}

export function computeStats(c: CritterInstance): void {
  const def = getCreature(c.speciesId);
  const oldMax = c.maxHp;
  c.maxHp = calcStat(def.baseStats.hp, c.ivs.hp, c.level, c.nature, 'hp');
  c.stats = {
    atk: calcStat(def.baseStats.atk, c.ivs.atk, c.level, c.nature, 'atk'),
    def: calcStat(def.baseStats.def, c.ivs.def, c.level, c.nature, 'def'),
    spa: calcStat(def.baseStats.spa, c.ivs.spa, c.level, c.nature, 'spa'),
    spd: calcStat(def.baseStats.spd, c.ivs.spd, c.level, c.nature, 'spd'),
    spe: calcStat(def.baseStats.spe, c.ivs.spe, c.level, c.nature, 'spe'),
  };
  c.currentHp = Math.min(c.currentHp + (c.maxHp - oldMax), c.maxHp);
}

export interface CreateCritterOpts {
  ivs?: CritterIvs;
  nature?: string;
  ability?: string;
  perfectIvs?: boolean;
}

export function createCritter(
  speciesId: string,
  level: number,
  nickname?: string,
  opts: CreateCritterOpts = {},
): CritterInstance {
  const def = getCreature(speciesId);
  const ivs = opts.ivs ?? (opts.perfectIvs ? { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 } : randomIvs());
  const nature = opts.nature ?? randomNature();
  const ability = opts.ability ?? def.ability ?? defaultAbilityForTypes(def.types);
  const moveIds = movesKnownAtLevel(speciesId, level);

  const c: CritterInstance = {
    uid: nextUid(),
    speciesId,
    nickname,
    level,
    exp: expForLevel(level),
    currentHp: 0,
    maxHp: 0,
    stats: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs,
    nature,
    ability,
    moves: moveIds.map(id => {
      const m = getMove(id);
      return { id, pp: m.pp, maxPp: m.pp };
    }),
    statStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    status: null,
    statusTurns: 0,
  };
  computeStats(c);
  c.currentHp = c.maxHp;
  return c;
}

export function recalcStats(c: CritterInstance): void {
  computeStats(c);
}

export function displayName(c: CritterInstance): string {
  return c.nickname ?? getCreature(c.speciesId).name;
}

export function typesOf(c: CritterInstance): ElementType[] {
  return getCreature(c.speciesId).types;
}

export function isFainted(c: CritterInstance): boolean {
  return c.currentHp <= 0;
}

export function firstAlive(party: CritterInstance[]): CritterInstance | null {
  return party.find(c => !isFainted(c)) ?? null;
}

export function healParty(party: CritterInstance[]): void {
  for (const c of party) {
    c.currentHp = c.maxHp;
    c.statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    clearStatus(c);
    for (const m of c.moves) {
      m.pp = getMove(m.id).pp;
    }
  }
}

export function addExp(c: CritterInstance, amount: number): { leveledUp: boolean; newLevel: number; oldLevel: number }[] {
  const results: { leveledUp: boolean; newLevel: number; oldLevel: number }[] = [];
  const startLevel = c.level;
  c.exp += amount;
  const newLevel = levelFromExp(c.exp);
  while (c.level < newLevel && c.level < 100) {
    const oldLevel = c.level;
    c.level++;
    recalcStats(c);
    results.push({ leveledUp: true, newLevel: c.level, oldLevel });
  }
  if (results.length === 0) results.push({ leveledUp: false, newLevel: c.level, oldLevel: startLevel });
  return results;
}

export function registerSeen(dexSeen: string[], speciesId: string): void {
  if (!dexSeen.includes(speciesId)) dexSeen.push(speciesId);
}

export function registerCaught(dexCaught: string[], speciesId: string, dexSeen?: string[]): void {
  if (dexSeen) registerSeen(dexSeen, speciesId);
  if (!dexCaught.includes(speciesId)) dexCaught.push(speciesId);
}

export function defaultPlayer(): PlayerState {
  const items = emptyBag();
  addItem(items, 'potion', 3);
  addItem(items, 'capture_orb', 5);
  return {
    name: 'Trainer',
    characterId: 'scout',
    x: 12, y: 15,
    mapId: 'town',
    facing: 'up',
    party: [],
    storage: [],
    money: 1500,
    items,
    badges: [],
    dexSeen: [],
    dexCaught: [],
    starterId: '',
    storyFlags: {},
    defeatedTrainers: [],
    defeatedRematch: [],
    playTime: 0,
    started: false,
  };
}

export const GameState = {
  player: defaultPlayer() as PlayerState,
  reset() { this.player = defaultPlayer(); },
};

export { clearStatus } from './status';

export function migrateCritter(c: CritterInstance): CritterInstance {
  const def = getCreature(c.speciesId);
  if (!c.ivs) c.ivs = randomIvs();
  if (!c.nature) c.nature = randomNature();
  if (!c.ability) c.ability = def.ability ?? defaultAbilityForTypes(def.types);
  if (c.status === undefined) c.status = null;
  computeStats(c);
  return c;
}
