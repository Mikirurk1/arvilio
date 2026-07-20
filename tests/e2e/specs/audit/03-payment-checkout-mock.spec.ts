/**
 * АУДИТ Етап 3 — 3K.5 provider checkout (B1/B6 route-mock).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

test('3K.5 Pay online fires createLessonPurchaseCheckout (mocked)', async ({ page }) => {
  let checkoutCalled = false;
  await page.route('**/api/graphql', async (route) => {
    const body = route.request().postDataJSON() as { query?: string } | null;
    if (body?.query?.includes('createLessonPurchaseCheckout')) {
      checkoutCalled = true;
      await route.fulfill({
        json: { data: { createLessonPurchaseCheckout: { checkoutUrl: '/payment?checkout=mock' } } },
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/payment');
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
  await page.getByText(/^loading/i).first().waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

  const payBtn = page.getByRole('button', { name: /stripe|liqpay|wayforpay|pay online/i }).first();
  if (!(await payBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'No online payment button (method not enabled for student)');
    return;
  }
  await payBtn.click();
  await expect.poll(() => checkoutCalled, { timeout: 10_000 }).toBe(true);
});
