// Generates the PWA icons (public/icon-*.png, apple-touch-icon.png) without
// any native dependencies: pixels are drawn into a raw RGBA buffer and encoded
// as PNG using node's built-in zlib. Run with: npm run icons
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// --- minimal PNG encoder -----------------------------------------------------

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA

  // Each scanline is prefixed with filter byte 0 (none)
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- drawing helpers ---------------------------------------------------------

function makeCanvas(size) {
  const buf = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = 255;
  };
  return { buf, set };
}

const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;

function inRoundedSquare(x, y, size, radius) {
  const lo = radius;
  const hi = size - 1 - radius;
  if (x >= lo && x <= hi) return true;
  if (y >= lo && y <= hi) return true;
  const cx = x < lo ? lo : hi;
  const cy = y < lo ? lo : hi;
  return inCircle(x, y, cx, cy, radius);
}

function inTriangle(px, py, [ax, ay], [bx, by], [cx, cy]) {
  const sign = (x1, y1, x2, y2, x3, y3) => (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const d1 = sign(px, py, ax, ay, bx, by);
  const d2 = sign(px, py, bx, by, cx, cy);
  const d3 = sign(px, py, cx, cy, ax, ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

// --- the icon: Koko the orange bird on a night-blue tile ---------------------

const BG = [0x1a, 0x1a, 0x2e];
const BODY = [0xff, 0x8c, 0x42];
const EYE = [0xff, 0xff, 0xff];
const PUPIL = [0x22, 0x22, 0x22];
const BEAK = [0xff, 0xc9, 0x3c];

function drawIcon(size) {
  const { buf, set } = makeCanvas(size);
  const s = (f) => f * size;
  const beak = [
    [s(0.72), s(0.47)],
    [s(0.88), s(0.55)],
    [s(0.72), s(0.63)],
  ];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inRoundedSquare(x, y, size, s(0.18))) continue;
      let color = BG;
      if (inCircle(x, y, s(0.48), s(0.55), s(0.3))) color = BODY;
      if (inTriangle(x, y, ...beak)) color = BEAK;
      if (inCircle(x, y, s(0.58), s(0.45), s(0.1))) color = EYE;
      if (inCircle(x, y, s(0.61), s(0.45), s(0.05))) color = PUPIL;
      set(x, y, color);
    }
  }
  return encodePng(size, buf);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [file, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(join(OUT_DIR, file), drawIcon(size));
  console.log(`wrote public/${file} (${size}x${size})`);
}
