/**
 * Generates placeholder PWA icons (solid brand-colour PNGs) into a target dir.
 * Run via `npm run icons`; also runs automatically before `dev`/`build`.
 *
 * These are deliberately simple placeholders — replace with designed, maskable
 * icons before release (see DEVELOPMENT.md). Keeping them generated means no
 * binary assets live in version control.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function png(size, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  const row = Buffer.alloc(1 + size * 3);
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = process.argv[2] ?? 'public/icons';
mkdirSync(dir, { recursive: true });
const brand = [29, 111, 184]; // #1d6fb8
writeFileSync(`${dir}/icon-192.png`, png(192, brand));
writeFileSync(`${dir}/icon-512.png`, png(512, brand));
writeFileSync(`${dir}/icon-512-maskable.png`, png(512, brand));
writeFileSync(`${dir}/apple-touch-icon.png`, png(180, brand));
console.log(`Generated placeholder PWA icons in ${dir}`);
