#!/usr/bin/env node
/**
 * Patches РГР_Arvilio.docx: abbreviations after annotation, Appendix Г, updateFields.
 * Run: node scripts/patch-rgr-docx.mjs [source.docx] [output.docx]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { CODE_APPENDIX, CODE_APPENDIX_INTRO } from '../docs/coursework/coursework-code-appendix.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DEFAULT_SRC =
  '/Users/mikirurk/Downloads/Telegram Desktop/РГР_Arvilio.docx';
const DEFAULT_OUT = path.join(
  ROOT,
  'docs/coursework/РГР_Arvilio_оновлено.docx',
);

const ABBREVIATIONS = [
  ['API', 'Application Programming Interface — програмний інтерфейс додатка'],
  ['REST', 'архітектурний стиль веб-API на основі HTTP'],
  ['GraphQL', 'мова запитів і типізована схема API'],
  ['ORM', 'Object-Relational Mapping (Prisma)'],
  ['RBAC', 'Role-Based Access Control — доступ за ролями'],
  ['JWT', 'JSON Web Token — токен сесії'],
  ['OAuth', 'протокол делегованої авторизації (Google тощо)'],
  ['CRUD', 'Create, Read, Update, Delete'],
  ['UI / UX', 'інтерфейс / досвід користувача'],
  ['MVP', 'Minimum Viable Product'],
  ['SMTP', 'протокол електронної пошти'],
  ['TTL', 'Time To Live — час життя об’єкта (вкладення чату)'],
  ['CORS', 'Cross-Origin Resource Sharing'],
  ['DTO', 'Data Transfer Object'],
  ['FR / NFR', 'функціональні / нефункціональні вимоги'],
  ['CI', 'Continuous Integration — безперервна інтеграція'],
  ['npm', 'менеджер пакетів Node.js'],
  ['Socket.IO', 'бібліотека realtime-зв’язку (WebSocket)'],
  ['PostgreSQL', 'об’єктно-реляційна СУБД'],
  ['Meet', 'Google Meet — відеозв’язок для уроків'],
];

const patchPy = path.join(__dirname, 'patch_rgr_docx.py');
const payload = {
  abbreviations: ABBREVIATIONS,
  abbrevTitle: 'ПЕРЕЛІК УМОВНИХ СКОРОЧЕНЬ',
  abbrevIntro:
    'У тексті роботи використано такі позначення та скорочення (якщо не розкрито окремо).',
  appendixIntro: CODE_APPENDIX_INTRO,
  appendix: CODE_APPENDIX,
};

const payloadPath = path.join(ROOT, 'docs/coursework/.rgr-patch-payload.json');
fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 0), 'utf8');

const src = process.argv[2] || DEFAULT_SRC;
const out = process.argv[3] || DEFAULT_OUT;

if (!fs.existsSync(src)) {
  console.error('Source not found:', src);
  process.exit(1);
}

fs.mkdirSync(path.dirname(out), { recursive: true });

const r = spawnSync('python3', [patchPy, src, out, payloadPath], {
  stdio: 'inherit',
  encoding: 'utf8',
});

fs.unlinkSync(payloadPath);

if (r.status !== 0) process.exit(r.status ?? 1);

const downloadsCopy = path.join(
  path.dirname(src),
  'РГР_Arvilio_оновлено.docx',
);
if (path.resolve(downloadsCopy) !== path.resolve(out)) {
  fs.copyFileSync(out, downloadsCopy);
  console.log('Also copied to:', downloadsCopy);
}

console.log('Written:', out);
