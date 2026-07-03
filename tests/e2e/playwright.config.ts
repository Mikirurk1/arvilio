import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { STATE } from './fixtures/auth';

/** Config lives in tests/e2e/ — webServer must run from repo root. */
const repoRoot = path.resolve(__dirname, '../..');
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../../playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Pass the E2E throttle-bypass token so GqlThrottlerGuard skips rate
    // limiting for test requests. In production set E2E_THROTTLE_BYPASS_TOKEN
    // explicitly; in local dev the API falls back to 'dev-e2e-bypass'.
    extraHTTPHeaders: {
      'x-e2e-skip-throttle':
        process.env['E2E_THROTTLE_BYPASS_TOKEN'] ?? 'dev-e2e-bypass',
    },
  },
  projects: [
    /** Auth setup — runs first, saves .auth/*.json */
    {
      name: 'setup',
      testDir: './setup',
      testMatch: /auth\.setup\.ts/,
    },

    /** Desktop Chrome — student role */
    {
      name: 'student',
      use: { ...devices['Desktop Chrome'], storageState: STATE.student },
      dependencies: ['setup'],
    },

    /** Desktop Chrome — teacher role */
    {
      name: 'teacher',
      use: { ...devices['Desktop Chrome'], storageState: STATE.teacher },
      dependencies: ['setup'],
    },

    /** Desktop Chrome — admin role */
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], storageState: STATE.admin },
      dependencies: ['setup'],
    },

    /** Mobile — student role (responsive check) */
    {
      name: 'mobile-student',
      use: { ...devices['Pixel 7'], storageState: STATE.student },
      dependencies: ['setup'],
    },

    /** Public (no auth) — for login, register, landing pages */
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'bash scripts/e2e-web-server.sh',
        cwd: repoRoot,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
