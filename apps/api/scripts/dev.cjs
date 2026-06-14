const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiRoot = path.join(__dirname, '..');
const repoRoot = path.join(apiRoot, '../..');
const srcRoot = path.join(apiRoot, 'src');
const backendModuleRoots = [
  path.join(repoRoot, 'packages/backend/modules'),
  path.join(repoRoot, 'packages/shared'),
];
const tscBin = path.join(repoRoot, 'node_modules/typescript/bin/tsc');
const tscAliasBin = path.join(repoRoot, 'node_modules/tsc-alias/dist/bin/index.js');
const distMain = path.join(repoRoot, 'dist/apps/api/apps/api/src/main.js');
const envFile = path.join(repoRoot, '.env');
const port = Number(process.env.PORT) || 3000;

function nodeArgsFor(distEntry) {
  const args = [];
  if (fs.existsSync(envFile)) {
    args.push('--env-file', envFile);
  } else {
    console.warn('[api:dev] no .env at repo root — SMTP and DB vars must come from the shell');
  }
  args.push(distEntry);
  return args;
}

function run(cmd, args) {
  execSync(`node "${cmd}" ${args.map((a) => `"${a}"`).join(' ')}`, {
    cwd: apiRoot,
    stdio: 'inherit',
  });
}

/** Clear stale listeners from a previous crashed dev session (startup only). */
function freePort() {
  try {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, {
      shell: true,
      stdio: 'ignore',
    });
  } catch {
    // ignore
  }
}

function isPortInUse() {
  try {
    const out = execSync(`lsof -ti :${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return Boolean(out);
  } catch {
    return false;
  }
}

async function waitForPortFree(maxMs = 5000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (!isPortInUse()) return;
    freePort();
    await new Promise((r) => setTimeout(r, 200));
  }
  if (isPortInUse()) {
    console.warn(`[api:dev] port ${port} still in use after ${maxMs}ms — forcing kill`);
    freePort();
    await new Promise((r) => setTimeout(r, 300));
  }
}

let rebuildInFlight = false;

function rebuild() {
  if (rebuildInFlight) {
    throw new Error('rebuild already in progress');
  }
  rebuildInFlight = true;
  try {
    run(tscBin, ['-p', path.join(repoRoot, 'packages/backend/email-templates/tsconfig.lib.json')]);
    run(tscBin, ['-p', 'tsconfig.app.json']);
    run(tscAliasBin, ['-p', 'tsconfig.app.json']);
  } finally {
    rebuildInFlight = false;
  }
}

let apiChild = null;
let stopping = false;
let rebuildTimer = null;
let workChain = Promise.resolve();
let watchReady = false;

function waitForExit(child, timeoutMs) {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      if (!child.killed) child.kill('SIGKILL');
      resolve();
    }, timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function stopApi() {
  const child = apiChild;
  apiChild = null;
  if (!child) return;
  child.kill('SIGTERM');
  await waitForExit(child, 3000);
}

async function startApi() {
  if (stopping) return;
  await stopApi();
  await waitForPortFree();
  if (stopping) return;

  apiChild = spawn('node', nodeArgsFor(distMain), {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  apiChild.on('exit', (code, signal) => {
    const wasCurrent = apiChild && apiChild.pid === (apiChild?.pid ?? -1);
    if (wasCurrent) apiChild = null;
    if (stopping || code === 0) return;
    console.error(`[api:dev] API exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})`);
  });
}

function queueRebuildAndRestart() {
  workChain = workChain
    .then(async () => {
      console.log('[api:dev] rebuilding…');
      rebuild();
      await startApi();
    })
    .catch((err) => {
      console.error('[api:dev] build/restart failed:', err.message ?? err);
    });
}

function scheduleRebuild() {
  if (!watchReady) return;
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(queueRebuildAndRestart, 1000);
}

freePort();

console.log('[api:dev] initial build…');
workChain = workChain.then(async () => {
  rebuild();
  await startApi();
}).catch((err) => {
  console.error('[api:dev] build/restart failed:', err.message ?? err);
});

setTimeout(() => {
  watchReady = true;
}, 4000);

function watchTree(root, label) {
  if (!fs.existsSync(root)) return;
  fs.watch(root, { recursive: true }, (_event, filename) => {
    if (!filename || !/\.tsx?$/.test(filename)) return;
    scheduleRebuild();
  });
  console.log(`[api:dev] watching ${label}`);
}

watchTree(srcRoot, 'apps/api/src');
for (const root of backendModuleRoots) {
  watchTree(root, path.relative(repoRoot, root));
}

async function shutdown() {
  stopping = true;
  watchReady = false;
  clearTimeout(rebuildTimer);
  await workChain.catch(() => {});
  await stopApi();
  freePort();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
