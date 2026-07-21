/**
 * АУДИТ Етап 7 — 7.4 Promo codes: chrome, create, disable (REST mocked).
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

test.describe('7.4 Promo codes', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/promo-codes`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('page chrome: create form + table', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/promo-codes`);
    await expect(page.getByRole('heading', { name: /promo codes/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByLabel(/^code$/i)).toBeVisible();
    await expect(page.getByLabel(/trial days/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create code/i })).toBeVisible();
  });

  test('Create code clears form after mocked POST', async ({ page }) => {
    const code = `E2E${Date.now()}`;
    await page.route('**/api/platform/promo-codes', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'promo_mock_1',
          code,
          trialDays: 14,
          maxRedemptions: null,
          redeemedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/promo-codes`);
    await expect(page.getByLabel(/^code$/i)).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^code$/i).fill(code);
    await page.getByLabel(/trial days/i).fill('14');

    const resPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/api/platform/promo-codes') &&
        r.request().method() === 'POST' &&
        !r.url().match(/promo-codes\/[^/]+$/),
    );
    await page.getByRole('button', { name: /create code/i }).click();
    const res = await resPromise;
    expect(res.ok()).toBeTruthy();
    await expect(page.getByLabel(/^code$/i)).toHaveValue('');
    await expect(page.getByText(/create failed/i)).toHaveCount(0);
  });

  test('Disable existing code fires mocked PATCH', async ({ page }) => {
    await page.route('**/api/platform/promo-codes/**', async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'promo_mock',
          code: 'MOCK',
          trialDays: 14,
          maxRedemptions: null,
          redeemedCount: 0,
          active: false,
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/promo-codes`);
    await expect(page.getByRole('heading', { name: /promo codes/i })).toBeVisible({
      timeout: 15_000,
    });

    const disableBtn = page.getByRole('button', { name: /^disable$/i }).first();
    if (!(await disableBtn.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'No active promo codes to disable');
      return;
    }

    const resPromise = page.waitForResponse(
      (r) => r.url().includes('/api/platform/promo-codes/') && r.request().method() === 'PATCH',
    );
    await disableBtn.click();
    const res = await resPromise;
    expect(res.status()).toBe(200);
    await expect(page.getByText(/update failed/i)).toHaveCount(0);
  });

  test('7.4.4 Enable disabled code fires mocked PATCH', async ({ page }) => {
    await page.route('**/api/platform/promo-codes/**', async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'promo_mock',
          code: 'MOCK',
          trialDays: 14,
          maxRedemptions: null,
          redeemedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/promo-codes`);
    await expect(page.getByRole('heading', { name: /promo codes/i })).toBeVisible({
      timeout: 15_000,
    });

    const enableBtn = page.getByRole('button', { name: /^enable$/i }).first();
    if (!(await enableBtn.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'No disabled promo codes to enable');
      return;
    }

    const resPromise = page.waitForResponse(
      (r) => r.url().includes('/api/platform/promo-codes/') && r.request().method() === 'PATCH',
    );
    await enableBtn.click();
    expect((await resPromise).status()).toBe(200);
    await expect(page.getByText(/update failed/i)).toHaveCount(0);
  });

  test('7.4.5 Duplicate code shows error message', async ({ page }) => {
    await page.route('**/api/platform/promo-codes', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Promo code already exists' }),
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/promo-codes`);
    await expect(page.getByLabel(/^code$/i)).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^code$/i).fill('DUPLICATE');
    await page.getByLabel(/trial days/i).fill('7');
    await page.getByRole('button', { name: /create code/i }).click();
    await expect(page.getByText(/already exists|create failed/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
