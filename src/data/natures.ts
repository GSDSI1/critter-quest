import { defaultRng, type Rng } from '../systems/rng';

export interface NatureDef {
  id: string;
  name: string;
  plus: 'atk' | 'def' | 'spa' | 'spd' | 'spe' | null;
  minus: 'atk' | 'def' | 'spa' | 'spd' | 'spe' | null;
}

export const NATURES: NatureDef[] = [
  { id: 'hardy', name: 'Hardy', plus: null, minus: null },
  { id: 'lonely', name: 'Lonely', plus: 'atk', minus: 'def' },
  { id: 'brave', name: 'Brave', plus: 'atk', minus: 'spe' },
  { id: 'adamant', name: 'Adamant', plus: 'atk', minus: 'spa' },
  { id: 'naughty', name: 'Naughty', plus: 'atk', minus: 'spd' },
  { id: 'bold', name: 'Bold', plus: 'def', minus: 'atk' },
  { id: 'docile', name: 'Docile', plus: null, minus: null },
  { id: 'relaxed', name: 'Relaxed', plus: 'def', minus: 'spe' },
  { id: 'impish', name: 'Impish', plus: 'def', minus: 'spa' },
  { id: 'lax', name: 'Lax', plus: 'def', minus: 'spd' },
  { id: 'timid', name: 'Timid', plus: 'spe', minus: 'atk' },
  { id: 'hasty', name: 'Hasty', plus: 'spe', minus: 'def' },
  { id: 'serious', name: 'Serious', plus: null, minus: null },
  { id: 'jolly', name: 'Jolly', plus: 'spe', minus: 'spa' },
  { id: 'naive', name: 'Naive', plus: 'spe', minus: 'spd' },
  { id: 'modest', name: 'Modest', plus: 'spa', minus: 'atk' },
  { id: 'mild', name: 'Mild', plus: 'spa', minus: 'def' },
  { id: 'quiet', name: 'Quiet', plus: 'spa', minus: 'spe' },
  { id: 'bashful', name: 'Bashful', plus: null, minus: null },
  { id: 'rash', name: 'Rash', plus: 'spa', minus: 'spd' },
  { id: 'calm', name: 'Calm', plus: 'spd', minus: 'atk' },
  { id: 'gentle', name: 'Gentle', plus: 'spd', minus: 'def' },
  { id: 'sassy', name: 'Sassy', plus: 'spd', minus: 'spe' },
  { id: 'careful', name: 'Careful', plus: 'spd', minus: 'spa' },
  { id: 'quirky', name: 'Quirky', plus: null, minus: null },
];

export function getNature(id: string): NatureDef {
  return NATURES.find(n => n.id === id) ?? NATURES[0];
}

export function randomNature(rng: Rng = defaultRng): string {
  return rng.pick(NATURES).id;
}

export function natureMult(natureId: string, stat: 'atk' | 'def' | 'spa' | 'spd' | 'spe'): number {
  const n = getNature(natureId);
  if (n.plus === stat) return 1.1;
  if (n.minus === stat) return 0.9;
  return 1;
}

export function randomIvs(rng: Rng = defaultRng): { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } {
  const r = () => rng.int(0, 31);
  return { hp: r(), atk: r(), def: r(), spa: r(), spd: r(), spe: r() };
}

export function perfectIvs(): { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } {
  return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
}
