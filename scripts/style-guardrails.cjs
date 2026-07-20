#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_FILES = [
  'apps/campus/src/app/vocabulary/page.module.scss',
  'apps/campus/src/app/quiz/page.module.scss',
  'apps/campus/src/app/profile/page.module.scss',
  'apps/campus/src/app/students/[studentId]/page.module.scss',
  'apps/campus/src/app/calendar/page.module.scss',
  'apps/campus/src/features/materials/media-viewer/media-viewer.module.scss',
];
const violations = [];

for (const relativePath of TARGET_FILES) {
  const fullPath = path.join(ROOT, relativePath);
  const text = fs.readFileSync(fullPath, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    const l = line.trim();
    if (l.includes('transition: all')) {
      violations.push(`${relativePath}:${index + 1} avoid "transition: all"`);
    }
    if (/font-weight:\s*650\b/.test(l)) {
      violations.push(`${relativePath}:${index + 1} use tokenized font-weight`);
    }
    if (/color:\s*#(?:[0-9a-fA-F]{3,8})\b/.test(l)) {
      violations.push(`${relativePath}:${index + 1} avoid hardcoded status hex color`);
    }
  });
}

if (violations.length > 0) {
  console.error('Style guardrails failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('Style guardrails passed.');
