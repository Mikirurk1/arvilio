#!/usr/bin/env node
/**
 * Free ports used by local dev (API 3000, Web 4200) before `npm run dev`.
 */
const { execSync } = require('child_process');

const ports = [3000, 4200];

for (const port of ports) {
  try {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, {
      shell: true,
      stdio: 'ignore',
    });
  } catch {
    // ignore
  }
}
