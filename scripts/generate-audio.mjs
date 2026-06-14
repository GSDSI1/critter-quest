#!/usr/bin/env node
/** Generate WAV sfx + 3-channel chiptune BGM loops into public/assets/audio/ */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'public/assets/audio');
mkdirSync(dir, { recursive: true });

const SR = 22050;

function writeWavHeader(dataLength, sampleRate = SR) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

function clamp(s) {
  return Math.max(-32768, Math.min(32767, s));
}

function floatToWav(path, samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    data.writeInt16LE(clamp(Math.floor(samples[i] * 32767)), i * 2);
  }
  writeFileSync(path, Buffer.concat([writeWavHeader(data.length), data]));
}

function osc(wave, freq, t) {
  const ph = t * freq;
  switch (wave) {
    case 'square': return Math.sin(2 * Math.PI * ph) > 0 ? 1 : -1;
    case 'pulse25': return (ph % 1) < 0.25 ? 1 : -1;
    case 'triangle': return 2 * Math.abs(2 * (ph - Math.floor(ph + 0.5))) - 1;
    case 'sawtooth': return 2 * (ph - Math.floor(ph + 0.5));
    default: return Math.sin(2 * Math.PI * ph);
  }
}

// ── SFX with layered envelopes ──

function renderTone(durationSec, fn) {
  const n = Math.floor(SR * durationSec);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i, n);
  return out;
}

function simpleSfx(freq, durationSec, wave, vol = 0.25) {
  return renderTone(durationSec, (t, i, n) => {
    const env = Math.min(1, i / (SR * 0.004)) * Math.min(1, (n - i) / (SR * 0.03));
    return osc(wave, freq, t) * vol * env;
  });
}

/** Quick ascending arpeggio chime. */
function arpSfx(freqs, noteSec, wave = 'square', vol = 0.22) {
  const per = Math.floor(SR * noteSec);
  const out = new Float64Array(per * freqs.length);
  freqs.forEach((f, k) => {
    for (let i = 0; i < per; i++) {
      const t = i / SR;
      const env = Math.min(1, i / (SR * 0.004)) * Math.min(1, (per - i) / (SR * 0.05));
      out[k * per + i] = (osc(wave, f, t) * 0.8 + osc('sine', f * 2, t) * 0.2) * vol * env;
    }
  });
  return out;
}

/** Pitch sweep with noise layer (hits, battle start). */
function sweepSfx(f0, f1, durationSec, vol = 0.25, noise = 0) {
  let seed = 1234;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296 - 0.5;
  };
  return renderTone(durationSec, (t, i, n) => {
    const f = f0 + (f1 - f0) * (i / n);
    const env = Math.min(1, i / (SR * 0.003)) * ((n - i) / n);
    return (osc('sawtooth', f, t) * (1 - noise) + rand() * 2 * noise) * vol * env;
  });
}

floatToWav(join(dir, 'menu_select.wav'), simpleSfx(440, 0.05, 'square'));
floatToWav(join(dir, 'menu_confirm.wav'), arpSfx([523, 659], 0.05, 'square', 0.2));
floatToWav(join(dir, 'hit.wav'), sweepSfx(220, 90, 0.1, 0.3, 0.35));
floatToWav(join(dir, 'level_up.wav'), arpSfx([523, 659, 784, 1047], 0.07, 'square', 0.2));
floatToWav(join(dir, 'catch.wav'), arpSfx([784, 988, 1175], 0.09, 'sine', 0.24));
floatToWav(join(dir, 'heal.wav'), arpSfx([494, 587, 740], 0.08, 'sine', 0.2));
floatToWav(join(dir, 'battle_start.wav'), sweepSfx(420, 130, 0.22, 0.26, 0.15));
floatToWav(join(dir, 'footstep_grass.wav'), simpleSfx(140, 0.04, 'triangle', 0.12));
floatToWav(join(dir, 'footstep_path.wav'), simpleSfx(100, 0.035, 'triangle', 0.1));

// ── 3-channel chiptune BGM ──
// Channels: melody (square/pulse), bass (triangle), drums (noise kick/hat).

function noteFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Render a song: melody/bass = [{ note: midi|null, beats }], drums = string
 * per half-beat ('k' kick, 'h' hat, '.' rest), looped to song length.
 */
function renderSong(path, { bpm, melody, bass, drums, melodyWave = 'square', vol = 0.1, loops = 2 }) {
  const beatDur = 60 / bpm;
  const songBeatsOne = melody.reduce((s, x) => s + x.beats, 0);
  const songBeats = songBeatsOne * loops;
  const n = Math.floor(songBeats * beatDur * SR);
  const out = new Float64Array(n);

  let pos = 0;
  for (let rep = 0; rep < loops; rep++) {
    for (const step of melody) {
      const len = Math.floor(step.beats * beatDur * SR);
      if (step.note != null) {
        const f = noteFreq(step.note);
        for (let i = 0; i < len && pos + i < n; i++) {
          const t = (pos + i) / SR;
          const env = Math.min(1, i / (SR * 0.006)) * Math.min(1, (len - i) / (SR * 0.05));
          out[pos + i] += osc(melodyWave, f, t) * 0.5 * env;
          out[pos + i] += osc('sine', f * 1.5, t) * 0.12 * env;
        }
      }
      pos += len;
    }
  }

  pos = 0;
  const bassBeats = bass.reduce((s, x) => s + x.beats, 0);
  const bassReps = Math.ceil(songBeats / bassBeats);
  for (let r = 0; r < bassReps; r++) {
    for (const step of bass) {
      const len = Math.floor(step.beats * beatDur * SR);
      if (step.note != null) {
        const f = noteFreq(step.note);
        for (let i = 0; i < len && pos + i < n; i++) {
          const t = (pos + i) / SR;
          const env = Math.min(1, i / (SR * 0.008)) * Math.min(1, (len - i) / (SR * 0.06));
          out[pos + i] += osc('triangle', f, t) * 0.4 * env;
        }
      }
      pos += len;
      if (pos >= n) break;
    }
    if (pos >= n) break;
  }

  if (drums) {
    let seed = 99;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296 - 0.5;
    };
    const halfBeat = Math.floor(beatDur * SR / 2);
    const totalHalves = Math.floor(n / halfBeat);
    for (let hb = 0; hb < totalHalves; hb++) {
      const ch = drums[hb % drums.length];
      if (ch === '.') continue;
      const start = hb * halfBeat;
      const dur = ch === 'k' ? Math.floor(SR * 0.07) : Math.floor(SR * 0.03);
      const amp = ch === 'k' ? 0.5 : 0.18;
      for (let i = 0; i < dur && start + i < n; i++) {
        const decay = 1 - i / dur;
        const tone = ch === 'k' ? osc('sine', 60 + 40 * decay, (start + i) / SR) * 0.6 : 0;
        out[start + i] += (rand() * 2 * 0.7 + tone) * amp * decay * decay;
      }
    }
  }

  for (let i = 0; i < n; i++) out[i] = Math.max(-1, Math.min(1, out[i] * vol * 2.2));
  floatToWav(path, out);
}

// MIDI helpers
const N = {
  G2: 43, A2: 45, B2: 47, C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, B3: 59,
  C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76,
};

// Town — gentle waltz feel
renderSong(join(dir, 'music_town.wav'), {
  bpm: 88,
  melodyWave: 'triangle',
  vol: 0.085,
  melody: [
    { note: N.G4, beats: 1 }, { note: N.E4, beats: 1 }, { note: N.C4, beats: 1 }, { note: N.E4, beats: 1 },
    { note: N.G4, beats: 1.5 }, { note: N.A4, beats: 0.5 }, { note: N.G4, beats: 2 },
    { note: N.F4, beats: 1 }, { note: N.D4, beats: 1 }, { note: N.B3, beats: 1 }, { note: N.D4, beats: 1 },
    { note: N.E4, beats: 1.5 }, { note: N.D4, beats: 0.5 }, { note: N.C4, beats: 2 },
  ],
  bass: [
    { note: N.C3, beats: 2 }, { note: N.G2, beats: 2 },
    { note: N.A2, beats: 2 }, { note: N.G2, beats: 2 },
  ],
  drums: '..h...h.',
});

// Route / overworld — upbeat adventure
renderSong(join(dir, 'music_overworld.wav'), {
  bpm: 104,
  melodyWave: 'square',
  vol: 0.08,
  melody: [
    { note: N.C4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.G4, beats: 1 }, { note: N.E4, beats: 0.5 }, { note: N.G4, beats: 0.5 }, { note: N.C5, beats: 1 },
    { note: N.B4, beats: 0.5 }, { note: N.G4, beats: 0.5 }, { note: N.A4, beats: 1 }, { note: N.G4, beats: 2 },
    { note: N.A4, beats: 0.5 }, { note: N.F4, beats: 0.5 }, { note: N.A4, beats: 1 }, { note: N.G4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.G4, beats: 1 },
    { note: N.D4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.F4, beats: 1 }, { note: N.E4, beats: 1 }, { note: N.C4, beats: 1 },
  ],
  bass: [
    { note: N.C3, beats: 1 }, { note: N.G3, beats: 1 }, { note: N.C3, beats: 1 }, { note: N.G3, beats: 1 },
    { note: N.A2, beats: 1 }, { note: N.E3, beats: 1 }, { note: N.F3, beats: 1 }, { note: N.G3, beats: 1 },
  ],
  drums: 'k.h.k.h.',
});

// Battle — driving minor
renderSong(join(dir, 'music_battle.wav'), {
  bpm: 138,
  melodyWave: 'pulse25',
  vol: 0.09,
  melody: [
    { note: N.A3, beats: 0.5 }, { note: N.A3, beats: 0.5 }, { note: N.C4, beats: 0.5 }, { note: N.A3, beats: 0.5 },
    { note: N.E4, beats: 0.5 }, { note: N.D4, beats: 0.5 }, { note: N.C4, beats: 0.5 }, { note: N.D4, beats: 0.5 },
    { note: N.E4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.G4, beats: 0.5 }, { note: N.E4, beats: 0.5 },
    { note: N.A4, beats: 1 }, { note: N.G4, beats: 1 },
    { note: N.F4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.D4, beats: 0.5 }, { note: N.E4, beats: 0.5 },
    { note: N.F4, beats: 1 }, { note: N.E4, beats: 0.5 }, { note: N.D4, beats: 0.5 },
    { note: N.C4, beats: 0.5 }, { note: N.D4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.B3, beats: 0.5 },
    { note: N.A3, beats: 2 },
  ],
  bass: [
    { note: N.A2, beats: 0.5 }, { note: N.A2, beats: 0.5 }, { note: N.A2, beats: 0.5 }, { note: N.G2, beats: 0.5 },
    { note: N.F3, beats: 0.5 }, { note: N.F3, beats: 0.5 }, { note: N.G3, beats: 0.5 }, { note: N.G3, beats: 0.5 },
  ],
  drums: 'kh.hkh.h',
});

// Gym — tense, syncopated
renderSong(join(dir, 'music_gym.wav'), {
  bpm: 126,
  melodyWave: 'square',
  vol: 0.085,
  melody: [
    { note: N.D4, beats: 0.5 }, { note: null, beats: 0.5 }, { note: N.D4, beats: 0.5 }, { note: N.F4, beats: 0.5 },
    { note: N.E4, beats: 0.5 }, { note: null, beats: 0.5 }, { note: N.C4, beats: 1 },
    { note: N.D4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.F4, beats: 0.5 }, { note: N.G4, beats: 0.5 },
    { note: N.A4, beats: 1.5 }, { note: N.G4, beats: 0.5 },
    { note: N.F4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.D4, beats: 0.5 }, { note: N.C4, beats: 0.5 },
    { note: N.D4, beats: 3 },
  ],
  bass: [
    { note: N.D3, beats: 0.75 }, { note: N.D3, beats: 0.75 }, { note: N.A2, beats: 0.5 },
    { note: N.C3, beats: 0.75 }, { note: N.C3, beats: 0.75 }, { note: N.G2, beats: 0.5 },
  ],
  drums: 'k..hk.h.',
});

// Cave — sparse, low, echoing
renderSong(join(dir, 'music_cave.wav'), {
  bpm: 72,
  melodyWave: 'triangle',
  vol: 0.07,
  melody: [
    { note: N.A3, beats: 2 }, { note: null, beats: 1 }, { note: N.C4, beats: 1 },
    { note: N.B3, beats: 2 }, { note: null, beats: 2 },
    { note: N.E3, beats: 2 }, { note: null, beats: 1 }, { note: N.G3, beats: 1 },
    { note: N.A3, beats: 4 },
  ],
  bass: [
    { note: N.A2, beats: 4 }, { note: N.G2, beats: 4 },
  ],
  drums: '......h.',
});

// Victory — bright fanfare
renderSong(join(dir, 'music_victory.wav'), {
  bpm: 120,
  melodyWave: 'square',
  vol: 0.09,
  melody: [
    { note: N.C4, beats: 0.5 }, { note: N.E4, beats: 0.5 }, { note: N.G4, beats: 0.5 }, { note: N.C5, beats: 1.5 },
    { note: N.B4, beats: 0.5 }, { note: N.C5, beats: 0.5 }, { note: N.D5, beats: 1 }, { note: N.C5, beats: 1 },
    { note: N.G4, beats: 0.5 }, { note: N.A4, beats: 0.5 }, { note: N.B4, beats: 0.5 }, { note: N.C5, beats: 1.5 },
    { note: N.E5, beats: 2 }, { note: N.C5, beats: 1 },
  ],
  bass: [
    { note: N.C3, beats: 1 }, { note: N.G3, beats: 1 }, { note: N.F3, beats: 1 }, { note: N.G3, beats: 1 },
  ],
  drums: 'k.h.khh.',
});

console.log('Wrote 9 SFX + 6 BGM themes (town, overworld, battle, gym, cave, victory) to public/assets/audio/');
spawnSync('node', ['scripts/import-cc0-bgm.mjs'], { cwd: root, stdio: 'inherit' });
