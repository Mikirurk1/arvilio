#!/usr/bin/env node
/**
 * Free ports used by local dev (API 3000, Campus 4200, Platform 4300, hub 4400, cms 4410).
 */
const { execSync } = require('child_process');

const ports = [3000, 4200, 4300, 4400, 4410];

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
