import { effectiveMusicVolume } from '../systems/audioSettings';

let musicCtx: AudioContext | null = null;
let musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let currentTheme = '';

function ctx(): AudioContext {
  if (!musicCtx) musicCtx = new AudioContext();
  return musicCtx;
}

function stopInternal(): void {
  for (const n of musicNodes) {
    try { n.osc.stop(); n.osc.disconnect(); } catch { /* already stopped */ }
  }
  musicNodes = [];
}

const THEMES: Record<string, number[]> = {
  overworld: [262, 330, 392, 523],
  battle: [196, 247, 294, 349],
  town: [294, 370, 440, 494],
};

export function startMusic(theme: keyof typeof THEMES | string): void {
  if (theme === currentTheme && musicNodes.length) return;
  stopInternal();
  currentTheme = theme;
  const vol = effectiveMusicVolume();
  if (vol <= 0) return;
  const freqs = THEMES[theme] ?? THEMES.overworld;
  const c = ctx();
  freqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = i === 0 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    gain.gain.value = vol * (i === 0 ? 0.06 : 0.025);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    musicNodes.push({ osc, gain });
  });
}

export function stopMusic(): void {
  currentTheme = '';
  stopInternal();
}

export function setMusicThemeForMap(mapId: string): void {
  if (mapId.includes('gym') || mapId === 'victory_road') startMusic('battle');
  else if (mapId === 'town' || mapId.includes('city') || mapId.includes('vale') || mapId === 'mindspire') startMusic('town');
  else startMusic('overworld');
}
