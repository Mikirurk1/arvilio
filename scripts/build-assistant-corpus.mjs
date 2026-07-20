#!/usr/bin/env node
/**
 * Regenerates curated assistant corpus keywords from Campus help tracks.
 * Does NOT overwrite the hand-curated ASSISTANT_CORPUS body — prints a report
 * of help step ids that could be merged manually.
 *
 * Usage: node scripts/build-assistant-corpus.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tracksDir = join(root, 'apps/campus/src/components/tour/tracks');

const helpFiles = readdirSync(tracksDir).filter(
  (f) => f.startsWith('help-') && f.endsWith('.ts') && !f.includes('.test'),
);

let total = 0;
for (const file of helpFiles) {
  const src = readFileSync(join(tracksDir, file), 'utf8');
  const ids = [...src.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
  total += ids.length;
  console.log(`${file}: ${ids.length} steps`);
}

console.log(`\nTotal help steps: ${total}`);
console.log(
  'Corpus lives in packages/backend/modules/module-assistant/src/infrastructure/corpus/assistant-corpus.ts',
);
console.log('Merge new help titles/bodies there (role-scoped; never curriculum answers).');
