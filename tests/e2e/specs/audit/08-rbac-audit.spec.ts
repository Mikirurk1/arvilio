/**
 * АУДИТ Етап 8 — RBAC негативні сценарії
 * Перевірка редіректів по ролях (route-policy.ts — джерело істини) + API без сесії.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

// ──────────────────────────────────────────────────────
// 8.1 STUDENT заборони
// ──────────────────────────────────────────────────────
test.describe('8.1 student denials', () => {
  test.use({ storageState: STATE.student });

  for (const path of ['/students', '/admin', '/system', '/staff', '/finance', '/billing', '/materials']) {
    test(`student → ${path} → redirect`, async ({ page }) => {
      await page.goto(path);
      await expect(page).not.toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`), { timeout: 10_000 });
      await expect(page).toHaveURL(/\/dashboard|\/login/, { timeout: 10_000 });
    });
  }
});

// ──────────────────────────────────────────────────────
// 8.2 TEACHER заборони
// ──────────────────────────────────────────────────────
test.describe('8.2 teacher denials', () => {
  test.use({ storageState: STATE.teacher });

  for (const path of ['/admin', '/system', '/staff', '/finance', '/billing', '/payment']) {
    test(`teacher → ${path} → redirect`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/dashboard|\/login/, { timeout: 10_000 });
    });
  }
});

// ──────────────────────────────────────────────────────
// 8.3 / 8.4 ADMIN: /system дозволено (код), /payment заборонено
// ──────────────────────────────────────────────────────
test.describe('8.3/8.4 admin scope', () => {
  test.use({ storageState: STATE.admin });

  test('admin → /system → allowed (route-policy)', async ({ page }) => {
    await page.goto('/system');
    await expect(page).toHaveURL(/\/system/, { timeout: 10_000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  });

  test('admin → /payment → redirect (student-only)', async ({ page }) => {
    await page.goto('/payment');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────
// 8.5 guest → редірект на /login
// ──────────────────────────────────────────────────────
test.describe('8.5 guest denials', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of ['/dashboard', '/lessons', '/system', '/billing']) {
    test(`guest → ${path} → /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
  }
});

// ──────────────────────────────────────────────────────
// 8.6 API без сесії → 401
// ──────────────────────────────────────────────────────
test.describe('8.6 API without session', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const endpoint of ['/api/auth/me', '/api/users/students', '/api/billing/entitlements', '/api/onboarding/tour']) {
    test(`GET ${endpoint} → 401/403`, async ({ request }) => {
      const res = await request.get(endpoint);
      expect([401, 403]).toContain(res.status());
    });
  }
});
