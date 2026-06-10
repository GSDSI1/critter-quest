const OPTIONS_KEY = 'critter-quest-options';

export type TextSpeed = 'slow' | 'normal' | 'fast';

export interface GameOptions {
  textSpeed: TextSpeed;
  alwaysRun: boolean;
}

const DEFAULTS: GameOptions = { textSpeed: 'normal', alwaysRun: false };

export const TEXT_SPEED_MS: Record<TextSpeed, number> = {
  slow: 18_000,
  normal: 12_000,
  fast: 6_000,
};

let cached: GameOptions = { ...DEFAULTS };

function load(): GameOptions {
  try {
    const raw = localStorage.getItem(OPTIONS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<GameOptions>;
    return {
      textSpeed: parsed.textSpeed === 'slow' || parsed.textSpeed === 'fast' ? parsed.textSpeed : 'normal',
      alwaysRun: parsed.alwaysRun === true,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function getOptions(): GameOptions {
  return cached;
}

export function setOptions(patch: Partial<GameOptions>): GameOptions {
  cached = { ...cached, ...patch };
  try {
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(cached));
  } catch { /* quota / private mode */ }
  return cached;
}

export function initOptions(): void {
  cached = load();
}

export function canAlwaysRun(): boolean {
  return cached.alwaysRun;
}

export function autoAdvanceMs(): number {
  return TEXT_SPEED_MS[cached.textSpeed];
}
