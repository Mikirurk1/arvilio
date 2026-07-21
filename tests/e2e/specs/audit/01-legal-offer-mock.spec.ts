/**
 * АУДИТ Етап 1 — 1E.5–7 legal pages + 1F public /offer (guest).
 */
import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from '../../helpers/a11y';

test.use({ storageState: { cookies: [], origins: [] } });

const sellerDto = {
  schoolName: 'E2E Language School',
  legalName: 'E2E Legal LLC',
  legalAddress: '1 Test St, Kyiv',
  legalCountry: 'UA',
  supportEmail: 'support@e2e.test',
  supportPhone: '+380501112233',
  mcc: '8299',
  termsOverrideMd: null as string | null,
  paymentRefundOverrideMd: null as string | null,
  isComplete: true,
};

test.describe('1E legal + 1F offer (public)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/school/seller-profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sellerDto),
      });
    });
  });

  test('1E.5 /legal/terms 200 + heading', async ({ page }) => {
    const res = await page.goto('/legal/terms');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { name: /public offer|terms/i }).first()).toBeVisible({
      timeout: 12_000,
    });
    await expect(page.getByText(/E2E Legal LLC|E2E Language School/i).first()).toBeVisible();
  });

  test('1E.6 /legal/contacts 200', async ({ page }) => {
    const res = await page.goto('/legal/contacts');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { name: /seller contacts|contacts/i })).toBeVisible({
      timeout: 12_000,
    });
    await expect(page.getByText('support@e2e.test')).toBeVisible();
    await expect(page.getByText(/E2E Legal LLC/i)).toBeVisible();
  });

  test('1E.7 /legal/payment-refund 200', async ({ page }) => {
    const res = await page.goto('/legal/payment-refund');
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByRole('heading', { name: /payment|refund|delivery/i }).first(),
    ).toBeVisible({ timeout: 12_000 });
  });

  test('1F.1 /offer packages OR empty', async ({ page }) => {
    await page.route('**/api/school/public-offer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schoolName: 'E2E Language School',
          packages: [
            {
              id: 'pkg-10',
              lessons: 10,
              label: 'Starter 10',
              description: 'Ten lessons pack',
              currency: 'UAH',
              amountMinor: 500000,
              pricePerLessonMinor: 50000,
              creditTrack: 'INDIVIDUAL',
            },
          ],
          enabledOnlineMethods: ['stripe', 'liqpay'],
          allowedProductsNote: 'Prepaid lesson credits only.',
        }),
      });
    });

    await page.goto('/offer');
    await expect(page.getByRole('heading', { name: /E2E Language School/i })).toBeVisible({
      timeout: 12_000,
    });
    await expect(page.getByText(/Starter 10/i)).toBeVisible();
  });

  test('1F.1 /offer empty state', async ({ page }) => {
    await page.route('**/api/school/public-offer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schoolName: 'E2E Language School',
          packages: [],
          enabledOnlineMethods: [],
          allowedProductsNote: '',
        }),
      });
    });

    await page.goto('/offer');
    await expect(page.getByText(/no packages|not available|empty|немає/i).first()).toBeVisible({
      timeout: 12_000,
    });
  });

  test('1F.2 enabled online method logos', async ({ page }) => {
    await page.route('**/api/school/public-offer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schoolName: 'E2E Language School',
          packages: [
            {
              id: 'pkg-1',
              lessons: 5,
              label: 'Five',
              currency: 'UAH',
              amountMinor: 250000,
              pricePerLessonMinor: 50000,
              creditTrack: 'INDIVIDUAL',
            },
          ],
          enabledOnlineMethods: ['stripe', 'liqpay'],
          allowedProductsNote: 'Credits only',
        }),
      });
    });

    await page.goto('/offer');
    await expect(page.getByRole('img', { name: /stripe/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('img', { name: /liqpay/i })).toBeVisible();
  });

  test('1F.3 axe /offer', async ({ page }) => {
    await page.route('**/api/school/public-offer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schoolName: 'E2E Language School',
          packages: [],
          enabledOnlineMethods: [],
          allowedProductsNote: '',
        }),
      });
    });
    await page.goto('/offer');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await expectNoA11yViolations(page);
  });
});
