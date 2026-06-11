#!/usr/bin/env node
/**
 * Import 16×16 Kenney/CC0 tiles into public/assets/tiles/tileset.png.
 * Drop source PNGs into public/assets/tiles/kenney/ and map them in kenney-map.json.
 * Does NOT run during npm run gen-assets — use manually after adding art.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { readPng, writePng } from './png-utils.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const kenneyDir = join(root, 'public/assets/tiles/kenney');
const mapPath = join(root, 'public/assets/tiles/kenney-map.json');
const out = join(root, 'public/assets/tiles/tileset.png');

const W = 16;
const COUNT = 51;
const H = W * COUNT;

function loadTilePng(filePath) {
  const { width, height, rgba } = readPng(filePath);
  if (width !== W || height !== W) {
    throw new Error(`${filePath}: expected ${W}×${W}, got ${width}×${height}`);
  }
  return rgba;
}

function main() {
  if (!existsSync(kenneyDir)) {
    console.log(`No ${kenneyDir} — create folder and add 16×16 PNGs, then edit kenney-map.json`);
    process.exit(0);
  }
  const pngs = readdirSync(kenneyDir).filter(f => f.endsWith('.png'));
  if (pngs.length === 0) {
    console.log('kenney/ folder is empty — nothing to import.');
    process.exit(0);
  }
  if (!existsSync(mapPath)) {
    console.error(`Missing ${mapPath}`);
    process.exit(1);
  }

  const mapping = JSON.parse(readFileSync(mapPath, 'utf8'));
  let baseSheet = null;
  if (existsSync(out)) {
    try {
      const { width, height, rgba } = readPng(out);
      if (width === W && height === H) baseSheet = rgba;
    } catch { /* regen from procedural if corrupt */ }
  }
  if (!baseSheet) {
    console.log('No existing tileset.png — running pack-tileset for autotile frames.');
    spawnSync('node', ['scripts/pack-tileset.mjs'], { cwd: root, stdio: 'inherit' });
    baseSheet = readPng(out).rgba;
  }

  let replaced = 0;
  for (const [filename, frameIndex] of Object.entries(mapping)) {
    const idx = Number(frameIndex);
    if (Number.isNaN(idx) || idx < 0 || idx >= COUNT) {
      console.warn(`Skip ${filename}: invalid frame index ${frameIndex}`);
      continue;
    }
    const src = join(kenneyDir, filename);
    if (!existsSync(src)) {
      console.warn(`Skip missing: ${filename}`);
      continue;
    }
    const tile = loadTilePng(src);
    for (let y = 0; y < W; y++) {
      tile.copy(baseSheet, ((idx * W + y) * W) * 4, y * W * 4, (y + 1) * W * 4);
    }
    replaced++;
    console.log(`  frame ${idx} ← ${filename}`);
  }

  writePng(out, W, H, baseSheet);
  console.log(`Wrote ${out} (${replaced} Kenney tiles merged into ${COUNT}-frame sheet)`);
}

main();
