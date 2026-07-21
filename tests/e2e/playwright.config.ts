import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { STATE } from './fixtures/auth';

/** Config lives in tests/e2e/ — webServer must run from repo root. */
const repoRoot = path.resolve(__dirname, '../..');
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200';
const isCI = !!process.env.CI;

/**
 * Project routing (CI verify): each spec file runs on one intended project.
 * Previously every file ran on student+teacher+admin+mobile+public → ~2045
 * serial runs with 1 worker blew the GitHub Actions 45m job limit.
 *
 * Shared multi-role files (`pages/*`, navigation, rbac, …) run once under `student`;
 * internal `test.use({ storageState })` still switches role per describe.
 */
export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: isCI,
  // One retry is enough for flake; two retries × 2k tests exceeded 45m on main.
  retries: isCI ? 1 : 0,
  // Serial CI (workers=1) could not finish the suite under the job timeout.
  workers: isCI ? Number(process.env.PLAYWRIGHT_WORKERS ?? 2) : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../../playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
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

    /** Guest / Control Plane — no campus role cookie */
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        'login.spec.ts',
        'audit/01-auth*.spec.ts',
        'audit/01-legal*.spec.ts',
        'audit/02-journey*.spec.ts',
        'audit/07-platform*.spec.ts',
      ],
    },

    /** Desktop Chrome — student role (+ shared multi-role suites) */
    {
      name: 'student',
      use: { ...devices['Desktop Chrome'], storageState: STATE.student },
      dependencies: ['setup'],
      testMatch: [
        'navigation.spec.ts',
        'product-pages.spec.ts',
        'pages/**/*.spec.ts',
        'audit/02-help*.spec.ts',
        'audit/02-invite*.spec.ts',
        'audit/03-*.spec.ts',
        'audit/08-rbac*.spec.ts',
        'audit/10-a11y*.spec.ts',
        'audit/11-edge*.spec.ts',
        'audit/11-network*.spec.ts',
        'audit/12-*.spec.ts',
        'tour/tour-student.spec.ts',
      ],
    },

    /** Desktop Chrome — teacher role */
    {
      name: 'teacher',
      use: { ...devices['Desktop Chrome'], storageState: STATE.teacher },
      dependencies: ['setup'],
      testMatch: ['audit/04-*.spec.ts', 'tour/tour-teacher.spec.ts'],
    },

    /** Desktop Chrome — admin role */
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], storageState: STATE.admin },
      dependencies: ['setup'],
      testMatch: [
        'audit/05-*.spec.ts',
        'audit/06-*.spec.ts',
        'audit/11-billing*.spec.ts',
        'tour/tour-admin.spec.ts',
      ],
    },

    /** Mobile — student role (responsive check) */
    {
      name: 'mobile-student',
      use: { ...devices['Pixel 7'], storageState: STATE.student },
      dependencies: ['setup'],
      testMatch: ['audit/09-responsive*.spec.ts'],
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
