#!/usr/bin/env node
/**
 * Optional CC0 BGM import — drop WAV/OGG into public/assets/audio/cc0-import/
 * with manifest.json mapping theme names to filenames. Kenney / OpenGameArt CC0
 * loops can replace procedural tracks when present.
 *
 * manifest.json example:
 * { "overworld": "adventure_loop.wav", "battle": "battle_loop.wav" }
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const importDir = join(root, 'public/assets/audio/cc0-import');
const outDir = join(root, 'public/assets/audio');
const manifestPath = join(importDir, 'manifest.json');
const themes = ['town', 'overworld', 'battle', 'gym', 'cave', 'victory'];

function main() {
  mkdirSync(importDir, { recursive: true });
  if (!existsSync(manifestPath)) {
    writeFileSync(manifestPath, `${JSON.stringify({
      _comment: 'Map theme → filename in cc0-import/. CC0 licensed only. See CREDITS.md.',
      town: null,
      overworld: null,
      battle: null,
      gym: null,
      cave: null,
      victory: null,
    }, null, 2)}\n`);
    console.log('Created cc0-import/manifest.json — add CC0 WAV/OGG files and re-run.');
    return;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let copied = 0;
  for (const theme of themes) {
    const srcName = manifest[theme];
    if (!srcName) continue;
    const src = join(importDir, srcName);
    if (!existsSync(src)) {
      console.warn(`  skip ${theme}: ${srcName} not found`);
      continue;
    }
    const ext = extname(srcName).toLowerCase() || '.wav';
    const dest = join(outDir, `music_${theme}${ext === '.ogg' ? '.ogg' : '.wav'}`);
    copyFileSync(src, dest);
    console.log(`  music_${theme} ← cc0-import/${srcName}`);
    copied++;
  }

  if (copied === 0) {
    const files = readdirSync(importDir).filter(f => !f.startsWith('.') && f !== 'manifest.json');
    if (files.length) console.log(`Found ${files.length} file(s) in cc0-import/ — set manifest.json entries.`);
    else console.log('No CC0 imports applied (procedural BGM remains).');
  } else {
    console.log(`Applied ${copied} CC0 BGM track(s). Update CREDITS.md with attribution if required.`);
  }
}

main();
