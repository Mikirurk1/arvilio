/**
 * Global setup: logs in as each role once and saves storageState.
 * Run as a Playwright "setup" project before the main test projects.
 */
import * as fs from 'node:fs';
import { test as setup, expect } from '@playwright/test';
import { STATE, AUTH_DIR } from '../fixtures/auth';
import { LoginPage } from '../pages/LoginPage';

const creds = {
  student: {
    email: process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test',
    password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!',
  },
  teacher: {
    email: process.env.PLAYWRIGHT_TEACHER_EMAIL ?? 'jest-teacher@soenglish.test',
    password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!',
  },
  admin: {
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL ?? 'jest-admin@soenglish.test',
    password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!',
  },
};

setup.beforeAll(() => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
});

for (const [role, { email, password }] of Object.entries(creds) as [keyof typeof creds, (typeof creds)[keyof typeof creds]][]) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.context().storageState({ path: STATE[role] });
  });
}
