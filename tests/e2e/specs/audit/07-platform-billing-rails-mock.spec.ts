/**
 * АУДИТ Етап 7 — 7.9 Payment rails (REST mocked).
 * Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

async function mockRailsPut(route: Route) {
  const req = route.request();
  const url = req.url();
  const method = req.method();

  if (method === 'POST' && url.includes('/rails/') && url.includes('/test')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Required secrets are saved. Live checkout test is not available for this rail yet.',
      }),
    });
    return;
  }

  if (method === 'PUT' && /\/billing\/rails\/?(\?|$)/.test(url)) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        defaultRailId: 'stripe_platform',
        rails: [
          {
            id: 'stripe_platform',
            title: 'Stripe',
            description: 'Cards',
            regions: ['*'],
            brandBg: '#635bff',
            brandFg: '#fff',
            enabled: true,
            configured: true,
            config: {},
            configFields: [],
            secretFields: [],
          },
        ],
      }),
    });
    return;
  }
  await route.continue();
}

test.describe('7.9 Payment rails', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/billing/rails`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('page chrome: search, market, save', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/rails`);
    await expect(page.getByRole('heading', { name: /payment rails/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByLabel(/^search$/i)).toBeVisible();
    await expect(page.getByLabel(/^market$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /save payment rails/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^stripe$/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('search filters rail cards', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/rails`);
    await expect(page.getByRole('heading', { name: /^stripe$/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByLabel(/^search$/i).fill('LiqPay');
    await expect(page.getByRole('heading', { name: /liqpay/i }).first()).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('heading', { name: /^stripe$/i })).toHaveCount(0);
  });

  test('Configure expands rail fields', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/rails`);
    await expect(page.getByRole('button', { name: /^configure$/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /^configure$/i }).first().click();
    await expect(page.getByRole('button', { name: /hide configuration/i }).first()).toBeVisible();
  });

  test('Save payment rails shows Saved (mocked PUT)', async ({ page }) => {
    await page.route('**/api/platform/billing/rails**', mockRailsPut);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/rails`);
    await expect(page.getByRole('button', { name: /save payment rails/i })).toBeVisible({
      timeout: 15_000,
    });

    const resPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/api/platform/billing/rails') &&
        r.request().method() === 'PUT' &&
        !r.url().includes('/test'),
    );
    await page.getByRole('button', { name: /save payment rails/i }).click();
    expect((await resPromise).ok()).toBeTruthy();
    await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 10_000 });
  });

  test('Test connection on configured rail (mocked)', async ({ page }) => {
    await page.route('**/api/platform/billing/rails**', mockRailsPut);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/rails`);
    await expect(page.getByRole('heading', { name: /payment rails/i })).toBeVisible({
      timeout: 15_000,
    });

    const testBtn = page.getByRole('button', { name: /test connection/i }).first();
    if (!(await testBtn.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'No configured rail with Test connection');
      return;
    }

    const resPromise = page.waitForResponse(
      (r) => r.url().includes('/test') && r.request().method() === 'POST',
    );
    await testBtn.click();
    expect((await resPromise).ok()).toBeTruthy();
    await expect(page.getByText(/secrets are saved|credentials ok|token|reachable|ok/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
