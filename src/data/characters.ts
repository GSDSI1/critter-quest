export interface TrainerPreset {
  id: string;
  label: string;
  body: number;
  hair: number;
  accent: number;
  skin: number;
  hat?: number;
}

export const TRAINER_PRESETS: TrainerPreset[] = [
  {
    id: 'scout',
    label: 'Scout',
    body: 0x3b82f6,
    hair: 0xfbbf24,
    accent: 0x1e3a5f,
    skin: 0xfcd9b6,
    hat: 0xdc2626,
  },
  {
    id: 'ranger',
    label: 'Ranger',
    body: 0x15803d,
    hair: 0x422006,
    accent: 0x854d0e,
    skin: 0xd4a574,
    hat: 0x166534,
  },
  {
    id: 'scholar',
    label: 'Scholar',
    body: 0x6366f1,
    hair: 0xe5e7eb,
    accent: 0x4338ca,
    skin: 0xf5d0c5,
  },
  {
    id: 'ace',
    label: 'Ace',
    body: 0xef4444,
    hair: 0x1a1a2e,
    accent: 0xb91c1c,
    skin: 0xc68642,
    hat: 0xfbbf24,
  },
];

export const DEFAULT_CHARACTER_ID = 'scout';

export function getTrainer(id: string): TrainerPreset {
  return TRAINER_PRESETS.find(t => t.id === id) ?? TRAINER_PRESETS[0];
}
