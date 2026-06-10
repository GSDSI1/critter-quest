import { readFileSync, writeFileSync } from 'fs';
import zlib from 'zlib';

export function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

export function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crc]);
}

export function readPng(path) {
  const buf = readFileSync(path);
  let pos = 8;
  let width = 0;
  let height = 0;
  const idats = [];
  while (pos + 12 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    pos += 4;
    const type = buf.toString('ascii', pos, pos + 4);
    pos += 4;
    const data = buf.subarray(pos, pos + len);
    pos += len + 4;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const rgba = Buffer.alloc(width * height * 4);
  let src = 0;
  for (let y = 0; y < height; y++) {
    src++; // filter byte (0 = none for our PNGs)
    for (let x = 0; x < width; x++) {
      const di = (y * width + x) * 4;
      rgba[di] = raw[src++];
      rgba[di + 1] = raw[src++];
      rgba[di + 2] = raw[src++];
      rgba[di + 3] = raw[src++];
    }
  }
  return { width, height, rgba };
}

export function writePng(path, w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    rgba.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

export function setPx(rgba, w, x, y, [R, G, B, A = 255]) {
  if (x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  rgba[i] = R; rgba[i + 1] = G; rgba[i + 2] = B; rgba[i + 3] = A;
}

export function getPx(rgba, w, x, y) {
  const i = (y * w + x) * 4;
  return [rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3]];
}

export function fillRect(rgba, w, _h, x, y, rw, rh, color) {
  for (let py = y; py < y + rh; py++) {
    for (let px = x; px < x + rw; px++) setPx(rgba, w, px, py, color);
  }
}

export function fillCircle(rgba, w, h, cx, cy, r, color) {
  for (let y = Math.max(0, cy - r); y <= Math.min(h - 1, cy + r); y++) {
    for (let x = Math.max(0, cx - r); x <= Math.min(w - 1, cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) setPx(rgba, w, x, y, color);
    }
  }
}

export function fillEllipse(rgba, w, h, cx, cy, rx, ry, color) {
  for (let y = Math.max(0, cy - ry); y <= Math.min(h - 1, cy + ry); y++) {
    for (let x = Math.max(0, cx - rx); x <= Math.min(w - 1, cx + rx); x++) {
      if (((x - cx) ** 2) / (rx * rx) + ((y - cy) ** 2) / (ry * ry) <= 1) {
        setPx(rgba, w, x, y, color);
      }
    }
  }
}

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rgbFromHex(hex) {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

export function shade([r, g, b], amt) {
  return [Math.max(0, Math.min(255, r + amt)), Math.max(0, Math.min(255, g + amt)), Math.max(0, Math.min(255, b + amt))];
}

export function outlineShape(rgba, w, h, outline = [26, 26, 46, 255]) {
  const copy = Buffer.from(rgba);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (copy[(y * w + x) * 4 + 3] === 0) {
        const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const nx = x + dx; const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) return false;
          return copy[(ny * w + nx) * 4 + 3] > 0;
        });
        if (neighbors) setPx(rgba, w, x, y, outline);
      }
    }
  }
}
