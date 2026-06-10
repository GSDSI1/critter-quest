#!/usr/bin/env node
/** Generate WAV sfx + chiptune BGM loops into public/assets/audio/ */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'public/assets/audio');
mkdirSync(dir, { recursive: true });

function writeWavHeader(dataLength, sampleRate = 22050) {
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

function clampSample(s) {
  return Math.max(-32768, Math.min(32767, s));
}

function writeWav(path, freq, durationSec, type = 'square', vol = 0.25) {
  const sampleRate = 22050;
  const n = Math.floor(sampleRate * durationSec);
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let v = 0;
    if (type === 'square') v = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
    else if (type === 'sawtooth') v = 2 * (t * freq - Math.floor(t * freq + 0.5));
    else v = Math.sin(2 * Math.PI * freq * t);
    const env = Math.min(1, (n - i) / (sampleRate * 0.02));
    data.writeInt16LE(clampSample(Math.floor(v * vol * env * 32767)), i * 2);
  }
  writeFileSync(path, Buffer.concat([writeWavHeader(data.length), data]));
}

function noteFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Render a looping chiptune pattern (CC0 procedural). */
function writeMusicLoop(path, pattern, { bpm = 108, vol = 0.11, wave = 'square' } = {}) {
  const sampleRate = 22050;
  const beatDur = 60 / bpm;
  let totalSec = 0;
  for (const step of pattern) totalSec += step.beats * beatDur;
  const n = Math.floor(sampleRate * totalSec);
  const data = Buffer.alloc(n * 2);
  let pos = 0;
  for (const step of pattern) {
    const stepSamples = Math.floor(step.beats * beatDur * sampleRate);
    const freq = noteFreq(step.note);
    for (let i = 0; i < stepSamples && pos < n; i++, pos++) {
      const t = pos / sampleRate;
      const phase = 2 * Math.PI * freq * t;
      let v = wave === 'triangle'
        ? 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1
        : Math.sin(phase) > 0 ? 1 : -1;
      const attack = Math.min(1, i / (sampleRate * 0.008));
      const release = Math.min(1, (stepSamples - i) / (sampleRate * 0.04));
      const env = attack * release * (step.accent ?? 1);
      data.writeInt16LE(clampSample(Math.floor(v * vol * env * 32767)), pos * 2);
    }
  }
  writeFileSync(path, Buffer.concat([writeWavHeader(data.length), data]));
}

const sfx = {
  menu_select: [440, 0.05, 'square'],
  menu_confirm: [523, 0.08, 'square'],
  hit: [180, 0.08, 'sawtooth'],
  level_up: [784, 0.12, 'sine'],
  catch: [880, 0.15, 'sine'],
  heal: [494, 0.12, 'sine'],
  battle_start: [220, 0.12, 'square'],
  footstep_grass: [140, 0.04, 'triangle', 0.12],
  footstep_path: [100, 0.035, 'triangle', 0.1],
};

for (const [name, args] of Object.entries(sfx)) {
  writeWav(join(dir, `${name}.wav`), ...args);
}

// MIDI note numbers — C4=60
const C4 = 60; const E4 = 64; const G4 = 67; const A3 = 57; const D4 = 62;
const F4 = 65; const B3 = 59; const G3 = 55;

writeMusicLoop(join(dir, 'music_overworld.wav'), [
  { note: C4, beats: 1 }, { note: E4, beats: 1 }, { note: G4, beats: 1 }, { note: E4, beats: 1 },
  { note: C4, beats: 1 }, { note: G4, beats: 1, accent: 1.2 }, { note: E4, beats: 2 },
  { note: D4, beats: 1 }, { note: F4, beats: 1 }, { note: A3, beats: 1, accent: 0.9 }, { note: F4, beats: 1 },
  { note: G4, beats: 2 }, { note: E4, beats: 2 },
], { bpm: 96, vol: 0.09, wave: 'triangle' });

writeMusicLoop(join(dir, 'music_battle.wav'), [
  { note: A3, beats: 0.5, accent: 1.3 }, { note: A3, beats: 0.5 }, { note: D4, beats: 0.5 }, { note: A3, beats: 0.5 },
  { note: E4, beats: 0.5, accent: 1.2 }, { note: D4, beats: 0.5 }, { note: A3, beats: 1 },
  { note: G3, beats: 0.5 }, { note: A3, beats: 0.5 }, { note: B3, beats: 0.5 }, { note: A3, beats: 0.5 },
  { note: D4, beats: 1 }, { note: E4, beats: 1, accent: 1.25 },
], { bpm: 132, vol: 0.1 });

writeMusicLoop(join(dir, 'music_town.wav'), [
  { note: G4, beats: 1 }, { note: E4, beats: 1 }, { note: C4, beats: 1 }, { note: E4, beats: 1 },
  { note: G4, beats: 1 }, { note: G4, beats: 1, accent: 1.15 }, { note: E4, beats: 2 },
  { note: F4, beats: 1 }, { note: D4, beats: 1 }, { note: B3, beats: 1 }, { note: D4, beats: 1 },
  { note: C4, beats: 4 },
], { bpm: 88, vol: 0.085, wave: 'triangle' });

console.log(`Wrote ${Object.keys(sfx).length} SFX + 3 BGM loops to public/assets/audio/`);
