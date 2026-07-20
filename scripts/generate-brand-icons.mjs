#!/usr/bin/env node
/**
 * Rasterize `apps/campus/public/brand/logo-mark.svg` into Next.js metadata PNGs.
 * Run: node scripts/generate-brand-icons.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = join(root, 'apps/campus/public/brand/logo-mark.svg');
const svg = readFileSync(svgPath);

const targets = [
  { path: join(root, 'apps/campus/src/app/apple-icon.png'), size: 180 },
  { path: join(root, 'apps/campus/public/apple-touch-icon.png'), size: 180 },
  { path: join(root, 'apps/campus/public/favicon-32x32.png'), size: 32 },
  { path: join(root, 'apps/campus/public/favicon-16x16.png'), size: 16 },
];

for (const { path: out, size } of targets) {
  await sharp(svg, { density: 288 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(`wrote ${out} (${size}×${size})`);
}
