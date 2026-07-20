#!/usr/bin/env node
/**
 * Prune Next.js .next caches when they grow large enough to cause macOS OOM
 * (SIGKILL on API/Campus). Turbopack can leave multi-GB debris under apps/.
 *
 * Usage:
 *   node scripts/clean-next-cache.cjs              # prune if over threshold
 *   node scripts/clean-next-cache.cjs --force      # delete all listed .next dirs
 *   node scripts/clean-next-cache.cjs --check      # report sizes only
 *   node scripts/clean-next-cache.cjs --app campus # only one app
 *
 * Env:
 *   CLEAN_NEXT_MAX_GB=2   # default threshold (decimal GB)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPS = ['campus', 'cms', 'platform', 'hub'];

const args = process.argv.slice(2);
const force = args.includes('--force');
const checkOnly = args.includes('--check');
const appIdx = args.indexOf('--app');
const onlyApp = appIdx >= 0 ? args[appIdx + 1] : null;

const maxGb = Number(process.env.CLEAN_NEXT_MAX_GB || '2');
const maxBytes = maxGb * 1024 * 1024 * 1024;

function candidates() {
  const apps = onlyApp ? [onlyApp] : APPS;
  const dirs = [];
  for (const app of apps) {
    dirs.push(path.join(ROOT, 'apps', app, '.next'));
    dirs.push(path.join(ROOT, 'dist', 'apps', app, '.next'));
  }
  return dirs.filter((d) => fs.existsSync(d));
}

function sizeBytes(dir) {
  try {
    const out = execSync(`du -sk "${dir}"`, { encoding: 'utf8' }).trim();
    const kb = Number(out.split(/\s+/)[0]);
    return Number.isFinite(kb) ? kb * 1024 : 0;
  } catch {
    return 0;
  }
}

function fmt(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

const dirs = candidates();
if (dirs.length === 0) {
  console.log('[clean-next] no .next dirs found');
  process.exit(0);
}

let removed = 0;
for (const dir of dirs) {
  const bytes = sizeBytes(dir);
  const rel = path.relative(ROOT, dir);
  const over = bytes >= maxBytes;
  if (checkOnly) {
    console.log(`[clean-next] ${rel}: ${fmt(bytes)}${over ? ' (over threshold)' : ''}`);
    continue;
  }
  if (!force && !over) {
    console.log(`[clean-next] keep ${rel} (${fmt(bytes)} < ${maxGb} GB)`);
    continue;
  }
  console.log(`[clean-next] removing ${rel} (${fmt(bytes)})`);
  fs.rmSync(dir, { recursive: true, force: true });
  removed += 1;
}

if (!checkOnly) {
  console.log(
    removed
      ? `[clean-next] removed ${removed} cache(s); next cold start will be slower`
      : `[clean-next] nothing to remove (threshold ${maxGb} GB)`,
  );
}
