/**
 * АУДИТ Етап 7 — 7.9 Campus plans (REST mocked).
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

test.describe('7.9 Campus plans', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/billing/campus-plans`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('page chrome: heading + save or empty rails state', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/campus-plans`);
    await expect(page.getByRole('heading', { name: /campus plans/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: /save campus plans/i })).toBeVisible();

    const empty = page.getByText(/no payment rails are ready/i);
    const defaultOffer = page.getByRole('heading', { name: /default offer/i });
    const hasOffer = await defaultOffer.isVisible({ timeout: 8_000 }).catch(() => false);
    const hasEmpty = await empty.isVisible().catch(() => false);
    expect(hasOffer || hasEmpty).toBeTruthy();
  });

  test('Save campus plans shows Saved (mocked PUT)', async ({ page }) => {
    await page.route('**/api/platform/billing/campus-subscription**', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          default: {
            railId: 'stripe_platform',
            currency: 'EUR',
            prices: { STARTER: { amountMinor: 2900 }, PRO: { amountMinor: 7900 } },
          },
          countryOverrides: [],
          availableRails: [
            { id: 'stripe_platform', title: 'Stripe', pricingMode: 'stripe' },
          ],
        }),
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/campus-plans`);
    await expect(page.getByRole('heading', { name: /campus plans/i })).toBeVisible({
      timeout: 15_000,
    });

    const saveBtn = page.getByRole('button', { name: /save campus plans/i });
    if (await saveBtn.isDisabled()) {
      test.skip(true, 'Save disabled — no availableRails (configure Payment rails first)');
      return;
    }

    const resPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/api/platform/billing/campus-subscription') &&
        r.request().method() === 'PUT',
    );
    await saveBtn.click();
    expect((await resPromise).ok()).toBeTruthy();
    await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 10_000 });
  });
});
