import type { CritterInstance } from './stats';
import { typesOf, displayName } from './stats';

export type Weather = 'rain' | 'sun' | 'hail' | null;

let battleWeather: Weather = null;

export function setBattleWeather(w: Weather): void {
  battleWeather = w;
}

export function getBattleWeather(): Weather {
  return battleWeather;
}

export function weatherLabel(w: Weather): string {
  switch (w) {
    case 'rain': return 'Rain pours down!';
    case 'sun': return 'The sunlight is harsh!';
    case 'hail': return 'Hail is falling!';
    default: return '';
  }
}

export function weatherBanner(w: Weather): string {
  switch (w) {
    case 'rain': return 'RAIN';
    case 'sun': return 'SUN';
    case 'hail': return 'HAIL';
    default: return '';
  }
}

export function weatherDamageMult(w: Weather, moveType: string): number {
  if (w === 'rain') {
    if (moveType === 'tide') return 1.3;
    if (moveType === 'flame') return 0.7;
  }
  if (w === 'sun') {
    if (moveType === 'flame') return 1.3;
    if (moveType === 'tide') return 0.7;
  }
  return 1;
}

/** Chlorophyll doubles speed in sun; Swift Swim doubles in rain. */
export function weatherSpeedMult(w: Weather, ability: string): number {
  if (w === 'sun' && ability === 'chlorophyll') return 2;
  if (w === 'rain' && ability === 'swift_swim') return 2;
  return 1;
}

/** End-of-turn hail chip on non-ice critters. Returns message or null. */
export function applyHailChip(c: CritterInstance): string | null {
  if (battleWeather !== 'hail' || c.currentHp <= 0) return null;
  if (typesOf(c).includes('ice')) return null;
  const dmg = Math.max(1, Math.floor(c.maxHp / 16));
  c.currentHp = Math.max(0, c.currentHp - dmg);
  return `${displayName(c)} is buffeted by the hail!`;
}

/** Camera tint per weather for the battle scene (0 = none). */
export function weatherTint(w: Weather): number {
  switch (w) {
    case 'rain': return 0x9ab8d8;
    case 'sun': return 0xffe8b0;
    case 'hail': return 0xd8e8f8;
    default: return 0;
  }
}
