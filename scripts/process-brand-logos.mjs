import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'apps/web/public/brand');
const ASSETS =
  '/Users/mikirurk/.cursor/projects/Users-mikirurk-Programming-SoEnglish/assets';

function isExportBackdrop(r, g, b) {
  return r > 60 && r < 90 && g > 100 && g < 125 && b > 65 && b < 95;
}

function isCheckerBg(r, g, b) {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  return spread <= 12 && avg >= 235 && avg < 254;
}

function isNearBlackBg(r, g, b) {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  return spread <= 10 && avg <= 18;
}

function isBgPixel(r, g, b) {
  return isExportBackdrop(r, g, b) || isCheckerBg(r, g, b) || isNearBlackBg(r, g, b);
}

function floodTransparent(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const q = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * channels;
    if (!isBgPixel(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    data[i + 3] = 0;
    q.push([x, y]);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, width - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (q.length) {
    const [x, y] = q.pop();
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

function removeExportBackdrop(data, width, height, channels) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (isExportBackdrop(data[i], data[i + 1], data[i + 2])) {
        data[i + 3] = 0;
      }
    }
  }
}

async function process(src, dst, targetW, { flood = true } = {}) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  removeExportBackdrop(data, info.width, info.height, info.channels);
  if (flood) floodTransparent(data, info.width, info.height, info.channels);
  const outPath = path.join(OUT, dst);
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize(targetW, null, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  const meta = await sharp(outPath).metadata();
  console.log(dst, `${meta.width}x${meta.height}`);
}

const jobs = [
  [path.join(ROOT, 'apps/web/public/brand/soenglish-logo.png'), 'soenglish-logo-on-light.png', 2048, { flood: true }],
  [path.join(ROOT, 'apps/web/public/brand/soenglish-logo-mark.png'), 'soenglish-logo-mark-on-light.png', 1024, { flood: false }],
  [path.join(ASSETS, 'soenglish-logo-on-dark.png'), 'soenglish-logo-on-dark.png', 2048, { flood: true }],
  [path.join(ASSETS, 'soenglish-logo-mark-on-dark.png'), 'soenglish-logo-mark-on-dark.png', 1024, { flood: false }],
];

for (const [src, dst, w, opts] of jobs) {
  await process(src, dst, w, opts);
}
