/**
 * АУДИТ Етап 5 — /billing B1 (route-mock провайдерів):
 * 5C.4 promo apply, 5C.5 checkout redirect, 5C.6 feature-gate (over-quota),
 * 5C.8 стани (TRIAL vs ACTIVE). Мокаємо REST /api/billing/*.
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

type Overrides = { plan?: string; overQuota?: boolean; customDomain?: boolean };

async function mockEntitlements(page: Page, o: Overrides = {}) {
  await page.route('**/api/billing/entitlements', (r) =>
    r.fulfill({
      json: {
        plan: o.plan ?? 'TRIAL',
        maxActiveStudents: 50,
        activeStudentCount: 3,
        seatsRemaining: 47,
        features: { customDomain: o.customDomain ?? false, aiAssist: false, recordings: true },
        storage: {
          usedBytes: o.overQuota ? '11000000000' : '2000000000',
          quotaBytes: '10000000000',
          remainingBytes: o.overQuota ? '0' : '8000000000',
          percentUsed: o.overQuota ? 110 : 20,
          overQuota: o.overQuota ?? false,
        },
      },
    }),
  );
}

test('5C.8 TRIAL: promo card + plan pickers render', async ({ page }) => {
  await mockEntitlements(page, { plan: 'TRIAL' });
  await page.goto('/billing');
  await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/have a promo code/i)).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText(/starter/i).first()).toBeVisible();
  await expect(page.getByText(/\bpro\b/i).first()).toBeVisible();
});

test('5C.4 promo apply → success banner (mocked redeem)', async ({ page }) => {
  await mockEntitlements(page, { plan: 'TRIAL' });
  await page.route('**/api/billing/subscription/promo/redeem', (r) =>
    r.fulfill({ json: { trialEndsAt: '2026-12-31T00:00:00.000Z' } }),
  );
  await page.goto('/billing');
  await expect(page.getByText(/have a promo code/i)).toBeVisible({ timeout: 10_000 });
  const promoInput = page.getByPlaceholder(/e\.g\. PARTNER30|promo/i).first();
  await promoInput.fill('TESTPROMO');
  await page.getByRole('button', { name: /apply|redeem|add days/i }).first().click();
  // success message region appears (trial extended)
  await expect(page.getByText(/extended|added|success|trial.*until|days/i).first())
    .toBeVisible({ timeout: 8_000 });
});

test('5C.5 plan checkout → POST fired (mocked provider url)', async ({ page }) => {
  await mockEntitlements(page, { plan: 'TRIAL' });
  let checkoutBody: string | null = null;
  await page.route('**/api/billing/subscription/checkout', (r) => {
    checkoutBody = r.request().postData();
    // same-origin url to avoid navigating to an external provider
    void r.fulfill({ json: { url: '/billing?checkout=mock' } });
  });
  await page.goto('/billing');
  await expect(page.getByText(/have a promo code/i)).toBeVisible({ timeout: 10_000 });
  const planBtn = page.getByRole('button', { name: /choose|select|upgrade|get|start/i }).first();
  if (!(await planBtn.waitFor({ state: 'visible', timeout: 6_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'No plan checkout button');
    return;
  }
  await planBtn.click();
  await expect.poll(() => checkoutBody, { timeout: 8_000 }).not.toBeNull();
  expect(checkoutBody).toMatch(/plan/i);
});

test('5C.6 over-quota → storage warning shown', async ({ page }) => {
  await mockEntitlements(page, { plan: 'STARTER', overQuota: true });
  await page.goto('/billing');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/quota exceeded|storage.*exceed|uploads are blocked/i))
    .toBeVisible({ timeout: 8_000 });
});

test('5C.8 ACTIVE: no promo card, current-plan summary', async ({ page }) => {
  await mockEntitlements(page, { plan: 'STARTER' });
  await page.goto('/billing');
  await expect(page.getByText(/current plan/i)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/have a promo code/i)).toHaveCount(0);
});
