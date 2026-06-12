import { DEX_ORDER, getCreature } from '../data/creatures';
import { SHINY_ODDS } from './stats';

/** Day stamp matching the lastMomGiftDay convention (days since epoch, local). */
export function dayStamp(now: Date = new Date()): number {
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
}

function mulberry(seed: number): number {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Featured species of the day — same for every player on a given date. */
export function featuredSpeciesOfDay(now: Date = new Date()): string {
  const idx = Math.floor(mulberry(dayStamp(now)) * DEX_ORDER.length);
  return DEX_ORDER[Math.min(idx, DEX_ORDER.length - 1)];
}

export function featuredSpeciesName(now: Date = new Date()): string {
  return getCreature(featuredSpeciesOfDay(now)).name;
}

/** Encounter-weight multiplier for the featured species. */
export const FEATURED_WEIGHT_MULT = 2;

/** Boosted shiny odds when encountering the featured species (1/64). */
export const FEATURED_SHINY_ODDS = 1 / 64;

export function shinyOddsFor(speciesId: string, now: Date = new Date()): number {
  return speciesId === featuredSpeciesOfDay(now) ? FEATURED_SHINY_ODDS : SHINY_ODDS;
}

export function featuredHintLine(now: Date = new Date()): string {
  return `Today's featured critter is ${featuredSpeciesName(now)} — sightings are up, and rare colors too!`;
}
