let ctx: AudioContext | null = null;

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.08): void {
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch { /* no audio */ }
}

export const Sfx = {
  menuSelect: () => beep(440, 0.05),
  menuConfirm: () => { beep(523, 0.06); setTimeout(() => beep(659, 0.08), 60); },
  introJingle: () => { [392, 494, 587, 784].forEach((f, i) => setTimeout(() => beep(f, 0.1, 'sine'), i * 100)); },
  footstepGrass: () => beep(120, 0.04, 'triangle', 0.04),
  footstepPath: () => beep(90, 0.03, 'triangle', 0.03),
  battleStart: () => { beep(220, 0.1); setTimeout(() => beep(330, 0.15), 100); },
  hit: () => beep(180, 0.08, 'sawtooth', 0.06),
  levelUp: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.1), i * 80)); },
  catch: () => { beep(880, 0.1); setTimeout(() => beep(1175, 0.2), 120); },
  heal: () => { [392, 494, 587].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'sine'), i * 100)); },
  faint: () => beep(110, 0.3, 'sawtooth', 0.05),
  evolution: () => { beep(330, 0.15); setTimeout(() => beep(660, 0.25), 200); },
  run: () => beep(200, 0.06),
};

export function resumeAudio(): void {
  ac().resume().catch(() => {});
}
