/**
 * Generates the PWA / home-screen icons into a target dir. Run via `npm run icons`;
 * also runs automatically before `dev`/`build`.
 *
 * Dependency-free by design (a tiny hand-rolled PNG encoder) so it works in CI with
 * no image toolchain or headless browser. It draws the World Explorer globe — a blue
 * tile with a white latitude/longitude grid — matching public/favicon.svg, so the
 * installed app and Add-to-Home-Screen icon are branded rather than a blank square.
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

/** Encode an RGBA pixel buffer (size*size*4) as a PNG. */
function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour + alpha (RGBA)
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BRAND = [29, 111, 184]; // #1d6fb8
const WHITE = [255, 255, 255];

/**
 * Draw the globe tile at `size`. Full-bleed brand blue (so it reads well as a maskable
 * icon and under iOS's own rounded mask), with a white grid: the outer circle, the
 * equator and prime meridian, plus one curved meridian pair and one curved parallel
 * pair (drawn as ellipse outlines), clipped inside the circle.
 */
function globe(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const c = (size - 1) / 2;
  const R = size * 0.34; // globe radius
  const sw = Math.max(2, size * 0.024); // stroke width
  const half = sw / 2;
  // Antialiased coverage of a stroke of half-width `half` at signed distance `d`.
  const cover = (d) => Math.max(0, Math.min(1, half + 0.5 - Math.abs(d)));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c;
      const dy = y - c;
      const dist = Math.hypot(dx, dy);
      let ink = 0; // white coverage 0..1

      if (dist <= R + half) {
        // Outer circle outline.
        ink = Math.max(ink, cover(dist - R));
        const inside = dist <= R - half * 0.5;
        if (inside) {
          // Equator + prime meridian.
          ink = Math.max(ink, cover(dy));
          ink = Math.max(ink, cover(dx));
          // Meridian pair: a tall/narrow ellipse outline (geom distance ≈ |g-1|/|grad|).
          for (const [ax, by] of [
            [R * 0.5, R], // meridians (curved verticals)
            [R, R * 0.5], // parallels (curved horizontals)
          ]) {
            const gx = dx / ax;
            const gy = dy / by;
            const g = gx * gx + gy * gy;
            const grad = Math.hypot(gx / ax, gy / by) * 2 || 1e-6;
            ink = Math.max(ink, cover((g - 1) / grad));
          }
        }
      }

      const [r, gg, b] = ink > 0 ? WHITE : BRAND;
      const [br, bgc, bb] = BRAND;
      const i = (y * size + x) * 4;
      // Composite white ink over the blue tile.
      rgba[i] = Math.round(br + (r - br) * ink);
      rgba[i + 1] = Math.round(bgc + (gg - bgc) * ink);
      rgba[i + 2] = Math.round(bb + (b - bb) * ink);
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, rgba);
}

const dir = process.argv[2] ?? 'public/icons';
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/icon-192.png`, globe(192));
writeFileSync(`${dir}/icon-512.png`, globe(512));
writeFileSync(`${dir}/icon-512-maskable.png`, globe(512));
writeFileSync(`${dir}/apple-touch-icon.png`, globe(180));
console.log(`Generated World Explorer globe icons in ${dir}`);
