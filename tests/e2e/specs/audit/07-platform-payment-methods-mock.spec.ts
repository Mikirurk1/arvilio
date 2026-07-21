/**
 * АУДИТ Етап 7 — 7.6 Platform Settings payment allowlist (REST route-mock).
 * Mutating PUT mocked. Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

async function mockPaymentMethodsPut(route: Route) {
  const req = route.request();
  if (req.method() === 'PUT' && req.url().includes('/payment-methods')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        allowed: ['STRIPE'],
        allMethods: ['STRIPE', 'PAYPAL', 'LIQPAY', 'MANUAL_INVOICE'],
      }),
    });
    return;
  }
  await route.continue();
}

test.describe('7.6 Platform payment methods (mocked REST)', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/settings`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('allowlist panel chrome visible', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/learner payment methods/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('group', { name: /payment methods/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save allowlist/i })).toBeVisible();
  });

  test('toggle Stripe and Save allowlist shows Saved (mocked)', async ({ page }) => {
    await page.route('**/api/platform/payment-methods**', mockPaymentMethodsPut);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/learner payment methods/i).first()).toBeVisible({
      timeout: 15_000,
    });

    const stripe = page.getByRole('button', { name: /^stripe$/i });
    await expect(stripe).toBeVisible({ timeout: 10_000 });
    await stripe.click();
    await page.getByRole('button', { name: /save allowlist/i }).click();
    await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 10_000 });
  });
});
