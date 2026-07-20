#!/usr/bin/env node
/** Fix TOC in РГР_Arvilio_оновлено.docx (add ПЕРЕЛІК + Додаток Г to table of contents). */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src =
  process.argv[2] ||
  '/Users/mikirurk/Downloads/Telegram Desktop/РГР_Arvilio_оновлено.docx';
const dst = process.argv[3] || src;

const r = spawnSync('python3', [path.join(__dirname, 'patch_rgr_docx.py'), '--toc-only', src, dst], {
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
