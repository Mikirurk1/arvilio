import { STATE } from '../fixtures/auth';
/**
 * Smoke tests — verify all product pages return 200 and render <main>.
 * Uses storageState so these run fast without re-login.
 */
import { test, expect } from '@playwright/test';

const studentPages = [
  '/dashboard',
  '/calendar',
  '/chat',
  '/vocabulary',
  '/practice',
  '/profile',
  '/quiz',
  '/lessons',
];

const teacherOnlyPages = ['/students', '/materials'];
const adminOnlyPages = ['/admin', '/system'];

test.describe('Student pages smoke', () => {
  test.use({ storageState: STATE.student });

  for (const route of studentPages) {
    test(`${route} loads <main>`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
    });
  }
});

test.describe('Teacher pages smoke', () => {
  test.use({ storageState: STATE.teacher });

  for (const route of [...studentPages, ...teacherOnlyPages]) {
    test(`${route} loads <main>`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
    });
  }
});

test.describe('Admin pages smoke', () => {
  test.use({ storageState: STATE.admin });

  for (const route of [...studentPages, ...teacherOnlyPages, ...adminOnlyPages]) {
    test(`${route} loads <main>`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
    });
  }
});
