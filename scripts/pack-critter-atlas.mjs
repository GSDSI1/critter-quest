#!/usr/bin/env node
/** Pack critter PNGs into Phaser atlases (64px + 32px). Run after generate-png-assets. */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readPng, writePng, setPx } from './png-utils.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const critterDir = join(root, 'public/assets/critters');

function packGroup(files, atlasW = 2048) {
  const items = files.map(file => {
    const { width, height, rgba } = readPng(join(critterDir, file));
    return { file, name: file.replace(/\.png$/, ''), width, height, rgba };
  }).sort((a, b) => a.name.localeCompare(b.name));

  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const item of items) {
    if (x + item.width > atlasW) {
      x = 0;
      y += rowH;
      rowH = 0;
    }
    item.x = x;
    item.y = y;
    x += item.width;
    rowH = Math.max(rowH, item.height);
  }
  const atlasH = y + rowH;
  const sheet = Buffer.alloc(atlasW * atlasH * 4, 0);
  const frames = {};

  for (const item of items) {
    for (let py = 0; py < item.height; py++) {
      for (let px = 0; px < item.width; px++) {
        const si = (py * item.width + px) * 4;
        const alpha = item.rgba[si + 3];
        if (alpha === 0) continue;
        setPx(sheet, atlasW, item.x + px, item.y + py, [
          item.rgba[si], item.rgba[si + 1], item.rgba[si + 2], alpha,
        ]);
      }
    }
    frames[item.name] = {
      frame: { x: item.x, y: item.y, w: item.width, h: item.height },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: item.width, h: item.height },
      sourceSize: { w: item.width, h: item.height },
    };
  }

  return { atlasW, atlasH, sheet, frames };
}

function writeAtlas(baseName, group) {
  if (group.length === 0) return;
  const { atlasW, atlasH, sheet, frames } = packGroup(group);
  const pngPath = join(critterDir, `${baseName}.png`);
  const jsonPath = join(critterDir, `${baseName}.json`);
  writePng(pngPath, atlasW, atlasH, sheet);
  writeFileSync(jsonPath, JSON.stringify({
    frames,
    meta: {
      app: 'Critter Quest',
      version: '1.0',
      image: `${baseName}.png`,
      format: 'RGBA8888',
      size: { w: atlasW, h: atlasH },
      scale: '1',
    },
  }, null, 2));
  console.log(`  ${baseName}: ${group.length} frames → ${atlasW}×${atlasH}`);
}

const all = readdirSync(critterDir).filter(f => f.endsWith('.png') && !f.startsWith('atlas'));
const lg = all.filter(f => !f.includes('_sm'));
const sm = all.filter(f => f.includes('_sm'));

writeAtlas('atlas', lg);
writeAtlas('atlas-sm', sm);

const metaPath = join(root, 'public/assets/meta.json');
const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
writeFileSync(metaPath, JSON.stringify({ ...meta, version: 3, atlas: true }, null, 2) + '\n');
console.log('Critter atlases packed; meta.json atlas:true');
