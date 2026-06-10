import { effectiveMusicVolume } from '../systems/audioSettings';

let musicScene: Phaser.Scene | null = null;
let musicSound: Phaser.Sound.BaseSound | null = null;
let currentTheme = '';

function stopInternal(): void {
  musicSound?.destroy();
  musicSound = null;
}

const OSC_THEMES: Record<string, number[]> = {
  overworld: [262, 330, 392, 523],
  battle: [196, 247, 294, 349],
  town: [294, 370, 440, 494],
};

let musicCtx: AudioContext | null = null;
let musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

function stopOscFallback(): void {
  for (const n of musicNodes) {
    try { n.osc.stop(); n.osc.disconnect(); } catch { /* stopped */ }
  }
  musicNodes = [];
}

function startOscFallback(theme: string, vol: number): void {
  stopOscFallback();
  const freqs = OSC_THEMES[theme] ?? OSC_THEMES.overworld;
  if (!musicCtx) musicCtx = new AudioContext();
  const c = musicCtx;
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

export function bindMusicScene(scene: Phaser.Scene): void {
  musicScene = scene;
}

export function startMusic(theme: keyof typeof OSC_THEMES | string): void {
  if (theme === currentTheme && (musicSound?.isPlaying || musicNodes.length)) return;
  stopInternal();
  stopOscFallback();
  currentTheme = theme;
  const vol = effectiveMusicVolume();
  if (vol <= 0) return;

  const key = `bgm_${theme}`;
  if (musicScene?.cache.audio.exists(key)) {
    musicSound = musicScene.sound.add(key, { loop: true, volume: vol });
    musicSound.play();
    return;
  }
  startOscFallback(theme, vol);
}

export function stopMusic(): void {
  currentTheme = '';
  stopInternal();
  stopOscFallback();
}

export function refreshMusicVolume(): void {
  if (!currentTheme) return;
  const vol = effectiveMusicVolume();
  if (musicSound) {
    if (vol <= 0) musicSound.pause();
    else {
      const s = musicSound as Phaser.Sound.WebAudioSound;
      if (s.setVolume) s.setVolume(vol);
      if (!musicSound.isPlaying) musicSound.resume();
    }
    return;
  }
  if (musicNodes.length) {
    musicNodes.forEach((n, i) => {
      n.gain.gain.value = vol * (i === 0 ? 0.06 : 0.025);
    });
  }
}

export function setMusicThemeForMap(mapId: string): void {
  if (mapId.includes('gym') || mapId === 'victory_road') startMusic('battle');
  else if (mapId === 'town' || mapId.includes('city') || mapId.includes('vale') || mapId === 'mindspire') startMusic('town');
  else startMusic('overworld');
}
