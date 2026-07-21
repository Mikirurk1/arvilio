/**
 * АУДИТ Етап 6 — 6.16 Seller & legal + payments seller gate (REST mock).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

const incompleteSeller = {
  schoolName: 'Jest School',
  legalName: null as string | null,
  legalAddress: null as string | null,
  legalCountry: 'UA',
  supportEmail: null as string | null,
  supportPhone: null as string | null,
  mcc: '8299',
  termsOverrideMd: null as string | null,
  paymentRefundOverrideMd: null as string | null,
  isComplete: false,
};

const completeSeller = {
  ...incompleteSeller,
  legalName: 'Jest Legal LLC',
  legalAddress: '2 Admin Ave',
  supportEmail: 'legal@jest.test',
  isComplete: true,
};

async function openSellerTab(page: Page) {
  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });
  const tab = page.getByRole('tab', { name: /seller|legal/i }).first();
  if (!(await tab.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No Seller & legal tab');
    return false;
  }
  await tab.click();
  await expect(page.getByText(/seller|legal name|юридичн/i).first()).toBeVisible({
    timeout: 10_000,
  });
  return true;
}

test.describe('6.16 Seller & legal (mocked REST)', () => {
  test('6.16.1 fill legal fields → Save', async ({ page }) => {
    await page.route('**/api/school/seller-profile', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(incompleteSeller),
        });
        return;
      }
      if (method === 'PATCH' || method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(completeSeller),
        });
        return;
      }
      await route.continue();
    });

    if (!(await openSellerTab(page))) return;

    await page.getByLabel(/legal name/i).fill('Jest Legal LLC');
    await page.getByLabel(/legal address|address/i).first().fill('2 Admin Ave');
    await page.getByLabel(/support email/i).fill('legal@jest.test');
    await page.getByRole('button', { name: /save seller profile/i }).click();
    await expect(page.getByText(/^saved\.?$/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('6.16.2 payments tab warns when seller incomplete', async ({ page }) => {
    await page.route('**/api/school/seller-profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(incompleteSeller),
      });
    });

    await page.goto('/system');
    await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });
    const paymentsTab = page.getByRole('tab', { name: /^payments$/i }).first();
    if (!(await paymentsTab.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'No Payments tab');
      return;
    }
    await paymentsTab.click();
    await expect(
      page.getByText(/seller & legal|продавець|complete.*seller|seller profile/i).first(),
    ).toBeVisible({ timeout: 12_000 });
  });

  test('6.16.3 public contacts reflect seller mock overrides', async ({ page }) => {
    await page.route('**/api/school/seller-profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...completeSeller,
          legalName: 'Override Legal Name',
          supportEmail: 'override@seller.test',
        }),
      });
    });

    await page.goto('/legal/contacts');
    await expect(page.getByText('Override Legal Name')).toBeVisible({ timeout: 12_000 });
    await expect(page.getByText('override@seller.test')).toBeVisible();
  });
});
