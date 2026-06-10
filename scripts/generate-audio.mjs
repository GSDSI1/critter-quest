#!/usr/bin/env node
/** Generate tiny WAV sfx into public/assets/audio/ */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'public/assets/audio');
mkdirSync(dir, { recursive: true });

function writeWav(path, freq, durationSec, type = 'square', vol = 0.25) {
  const sampleRate = 22050;
  const n = Math.floor(sampleRate * durationSec);
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let v = 0;
    if (type === 'square') v = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
    else v = Math.sin(2 * Math.PI * freq * t);
    const env = Math.min(1, (n - i) / (sampleRate * 0.02));
    const s = Math.floor(v * vol * env * 32767);
    data.writeInt16LE(Math.max(-32768, Math.min(32767, s)), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
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
  header.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([header, data]));
}

const sfx = {
  menu_select: [440, 0.05, 'square'],
  menu_confirm: [523, 0.08, 'square'],
  hit: [180, 0.08, 'sawtooth'],
  level_up: [784, 0.12, 'sine'],
  catch: [880, 0.15, 'sine'],
  heal: [494, 0.12, 'sine'],
  battle_start: [220, 0.12, 'square'],
};

for (const [name, [freq, dur, type]] of Object.entries(sfx)) {
  writeWav(join(dir, `${name}.wav`), freq, dur, type);
}
console.log(`Wrote ${Object.keys(sfx).length} WAV files to public/assets/audio/`);
