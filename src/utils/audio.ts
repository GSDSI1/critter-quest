import Phaser from 'phaser';
import { loadAudioSettings, effectiveSfxVolume, effectiveMusicVolume } from '../systems/audioSettings';

let audioScene: Phaser.Scene | null = null;
let ctx: AudioContext | null = null;

export function bindAudioScene(scene: Phaser.Scene): void {
  audioScene = scene;
  if (!scene.cache.audio.exists('sfx_menu_select')) {
    ['menu_select', 'menu_confirm', 'hit', 'level_up', 'catch', 'heal', 'battle_start'].forEach(k => {
      if (!scene.cache.audio.exists(`sfx_${k}`)) return;
    });
  }
}

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.08): void {
  try {
    const scaled = vol * effectiveSfxVolume();
    if (scaled <= 0) return;
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = scaled;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch { /* no audio */ }
}

function playWav(key: string, volScale = 1): boolean {
  if (!audioScene?.cache.audio.exists(key)) return false;
  const v = effectiveSfxVolume() * volScale;
  if (v <= 0) return true;
  try {
    audioScene.sound.play(key, { volume: v });
    return true;
  } catch {
    return false;
  }
}

function sfx(key: string, fallback: () => void): void {
  if (!playWav(`sfx_${key}`)) fallback();
}

export const Sfx = {
  menuSelect: () => sfx('menu_select', () => beep(440, 0.05)),
  menuConfirm: () => {
    if (!playWav('sfx_menu_confirm')) {
      beep(523, 0.06);
      setTimeout(() => beep(659, 0.08), 60);
    }
  },
  introJingle: () => { [392, 494, 587, 784].forEach((f, i) => setTimeout(() => beep(f, 0.1, 'sine'), i * 100)); },
  footstepGrass: () => beep(120, 0.04, 'triangle', 0.04),
  footstepPath: () => beep(90, 0.03, 'triangle', 0.03),
  battleStart: () => sfx('battle_start', () => { beep(220, 0.1); setTimeout(() => beep(330, 0.15), 100); }),
  hit: () => sfx('hit', () => beep(180, 0.08, 'sawtooth', 0.06)),
  levelUp: () => sfx('level_up', () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.1), i * 80)); }),
  catch: () => sfx('catch', () => { beep(880, 0.1); setTimeout(() => beep(1175, 0.2), 120); }),
  heal: () => sfx('heal', () => { [392, 494, 587].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'sine'), i * 100)); }),
  faint: () => beep(110, 0.3, 'sawtooth', 0.05),
  evolution: () => { beep(330, 0.15); setTimeout(() => beep(660, 0.25), 200); },
  run: () => beep(200, 0.06),
};

export function resumeAudio(): void {
  ac().resume().catch(() => {});
  loadAudioSettings();
}
