const KEY = 'critter-quest-audio';

export interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
  muted: boolean;
}

const DEFAULTS: AudioSettings = { master: 1, music: 0.7, sfx: 1, muted: false };

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) as Partial<AudioSettings> };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveAudioSettings(s: AudioSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function effectiveSfxVolume(): number {
  const s = loadAudioSettings();
  if (s.muted) return 0;
  return s.master * s.sfx;
}
