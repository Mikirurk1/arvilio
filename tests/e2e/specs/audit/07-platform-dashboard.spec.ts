/**
 * АУДИТ Етап 7 — 7.1 Dashboard KPIs chrome (live SSR data).
 * Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

test.describe('7.1 Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/dashboard`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('KPI cards and ops panels visible', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/dashboard`);

    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/^campuses$/i).first()).toBeVisible();
    await expect(page.getByText(/^active users$/i).first()).toBeVisible();
    await expect(page.getByText(/^mrr$/i).first()).toBeVisible();
    await expect(page.getByLabel(/secondary metrics/i)).toBeVisible();
    await expect(page.getByText(/rails configured/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /recent campuses/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /recent audit/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /view all/i }).first()).toBeVisible();
  });
});
