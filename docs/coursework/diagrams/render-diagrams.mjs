#!/usr/bin/env node
/**
 * Render coursework Mermaid diagrams to high-res PNG in ../screenshots/
 * Usage: node docs/coursework/diagrams/render-diagrams.mjs
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots');
const configFile = join(__dirname, 'mermaid-config.json');
const puppeteerFile = join(__dirname, 'puppeteer-config.json');

/** 3× scale + wide canvas → чітко в Word і при друці */
const SCALE = 3;
const WIDTH = 2200;

const diagrams = [
  ['01-architecture.mmd', '01-architecture.png', 2400],
  ['02-layers.mmd', '02-layers.png', 2000],
  ['04-monorepo-tree.mmd', '04-monorepo-tree.png', 1800],
  ['03-use-case.mmd', '03-use-case.png', 2400],
  ['05-erd-core.mmd', '05-erd.png', 2600],
  ['20-erd-full.mmd', '20-erd-full.png', 3200],
];

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const mmdcBase =
  `npx --yes @mermaid-js/mermaid-cli@11.4.0` +
  ` -c "${configFile}"` +
  ` -p "${puppeteerFile}"` +
  ` -s ${SCALE}` +
  ` -b "#ffffff"`;

for (const [src, dest, width] of diagrams) {
  const input = join(__dirname, src);
  const output = join(outDir, dest);
  console.log(`Rendering ${src} → screenshots/${dest} (${width}px, scale ${SCALE})`);
  execSync(`${mmdcBase} -w ${width} -i "${input}" -o "${output}"`, {
    stdio: 'inherit',
    cwd: __dirname,
  });
}

console.log('Done — high-res PNG in docs/coursework/screenshots/');
