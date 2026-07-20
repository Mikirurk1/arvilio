import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function loadRootEnv() {
  const filePath = resolve(REPO_ROOT, '.env');
  if (!existsSync(filePath)) return filePath;

  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    const dq = '"';
    const sq = "'";
    if (
      (value.startsWith(dq) && value.endsWith(dq)) ||
      (value.startsWith(sq) && value.endsWith(sq))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }

  return filePath;
}
