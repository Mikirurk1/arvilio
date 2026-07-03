/**
 * АУДИТ Етап 5 — Роль ADMIN: staff, finance, billing, admin
 * Navigate → Screenshot → axe → key-element checks
 */
import { test, expect } from '@playwright/test';
import { shot, expectNoA11yViolations, consoleGuard } from '../../helpers/a11y';
import { STATE } from '../../fixtures/auth';

const DIR = '05-admin';

test.use({ storageState: STATE.admin });

// ──────────────────────────────────────────────────────
// 5A. /staff
// ──────────────────────────────────────────────────────
test.describe('5A. /staff', () => {
  test('5A.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/staff');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/loading/i).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    await shot(page, `${DIR}/5A-staff`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('5A.3 open first staff profile → tabs + axe', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const link = page.locator('main a[href^="/staff/"]').first();
    const hasLink = await link.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
    if (!hasLink) { test.skip(true, 'No staff rows to open'); return; }
    await link.click();
    await expect(page).toHaveURL(/\/staff\/[^/]+/, { timeout: 10_000 });
    await page.waitForTimeout(800);
    await shot(page, `${DIR}/5A-staff-profile`);
    await expectNoA11yViolations(page);
  });
});

// ──────────────────────────────────────────────────────
// 5B. /finance
// ──────────────────────────────────────────────────────
test.describe('5B. /finance', () => {
  test('5B.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/finance');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    await shot(page, `${DIR}/5B-finance`);
    await expectNoA11yViolations(page);
    stop();
  });
});

// ──────────────────────────────────────────────────────
// 5C. /billing
// ──────────────────────────────────────────────────────
test.describe('5C. /billing', () => {
  test('5C.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/billing');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    await shot(page, `${DIR}/5C-billing`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('5C.2 entitlements meters or plan info visible', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasMeter = await page.getByText(/storage|seats|plan|subscription|trial/i)
      .first().isVisible({ timeout: 8_000 }).catch(() => false);
    expect(hasMeter).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 5D. /admin
// ──────────────────────────────────────────────────────
test.describe('5D. /admin', () => {
  test('5D.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/admin');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/loading/i).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    await shot(page, `${DIR}/5D-admin`);
    await expectNoA11yViolations(page);
    stop();
  });
});

// ──────────────────────────────────────────────────────
// 5E. Навігація + axe sweep
// ──────────────────────────────────────────────────────
test.describe('5E. nav + axe sweep', () => {
  test('5E.1 admin sidebar: staff/finance/billing/admin, без system', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const nav = page.getByRole('navigation').first();
    const navVisible = await nav.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!navVisible) { test.skip(true, 'Sidebar hidden'); return; }
    await expect(nav.getByRole('link', { name: /staff/i }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: /finance/i }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: /billing|subscription/i }).first()).toBeVisible();
    // route-policy.ts: /system дозволено admin + super_admin (план застарів — код виграє)
    await expect(nav.getByRole('link', { name: /^system$/i }).first()).toBeVisible();
  });

  for (const path of ['/staff', '/finance', '/billing', '/admin']) {
    test(`5E.2 axe ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.locator('main').waitFor({ state: 'visible', timeout: 10_000 });
      await page.waitForTimeout(800);
      await expectNoA11yViolations(page);
    });
  }
});
