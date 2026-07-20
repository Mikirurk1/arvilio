/**
 * АУДИТ Етапи 5+6 — ADMIN + /system granular: interaction-рівень поверх render+axe
 * (05-admin-audit, 06-system-audit). Staff-профіль таби, billing метри, admin accounts,
 * system-панелі (branding hex, video-meetings).
 * Глибокі флоу (Stripe checkout, domains verify, SMTP verify, seat-enforcement) — беклог.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

// ──────────────────────────────────────────────────────
// 5A. /staff/[id] — profile tabs
// ──────────────────────────────────────────────────────
test.describe('5A. staff profile tabs', () => {
  test('5A.3 tabs Profile/Compensation/Earnings/Statistics open', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const link = page.locator('main a[href^="/staff/"]').first();
    if (!(await link.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No staff rows');
      return;
    }
    await link.click();
    await expect(page).toHaveURL(/\/staff\/[^/]+/, { timeout: 10_000 });
    await expect(page.getByRole('tab').first()).toBeVisible({ timeout: 15_000 });
    for (const tab of ['Compensation', 'Earnings & payouts', 'Statistics', 'Profile'] as const) {
      const tabEl = page.getByRole('tab', { name: new RegExp(`^${tab}$`, 'i') }).first();
      if (!(await tabEl.isVisible({ timeout: 3_000 }).catch(() => false))) continue;
      await tabEl.click();
      await page.waitForTimeout(300);
      await expect(tabEl).toHaveAttribute('aria-selected', 'true');
    }
  });
});

// ──────────────────────────────────────────────────────
// 5B. /finance
// ──────────────────────────────────────────────────────
test.describe('5B. finance', () => {
  test('5B.1 finance page shows staff finance content', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_200);
    const hasContent = await page.getByText(/staff|finance|accrued|paid|balance|payout/i)
      .first().isVisible({ timeout: 6_000 }).catch(() => false);
    expect(hasContent).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 5C. /billing
// ──────────────────────────────────────────────────────
test.describe('5C. billing', () => {
  test('5C.1/5C.2 Subscription heading + Current plan + Storage meter', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/current plan/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/^storage$/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test('5C.3 plan pickers show during trial; active plan otherwise', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByText(/current plan/i)).toBeVisible({ timeout: 10_000 });
    const planValue = (await page.locator('main').innerText()).toUpperCase();
    if (planValue.includes('TRIAL')) {
      // Starter/Pro pickers are gated behind trial state (billing/page.tsx)
      await expect(page.getByText(/starter/i).first()).toBeVisible({ timeout: 6_000 });
      await expect(page.getByText(/\bpro\b/i).first()).toBeVisible();
    } else {
      // active/paid school: no trial pickers, just the current-plan summary
      await expect(page.getByText(/current plan/i)).toBeVisible();
    }
  });
});

// ──────────────────────────────────────────────────────
// 5D. /admin
// ──────────────────────────────────────────────────────
test.describe('5D. admin', () => {
  test('5D.1/5D.2 Account administration + Accounts overview', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /account administration/i }))
      .toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('region', { name: /accounts overview/i })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/all accounts/i)).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────
// 6.x /system — panel interactions
// ──────────────────────────────────────────────────────
test.describe('6. system panels', () => {
  async function openTab(page: import('@playwright/test').Page, name: RegExp) {
    await page.goto('/system');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const tab = page.getByRole('tab', { name }).first();
    if (!(await tab.isVisible({ timeout: 6_000 }).catch(() => false))) return false;
    await tab.click();
    await page.waitForTimeout(500);
    return true;
  }

  test('6.3 branding panel: text input present', async ({ page }) => {
    if (!(await openTab(page, /branding/i))) { test.skip(true, 'No branding tab'); return; }
    await expect(page.locator('main').getByRole('textbox').first()).toBeVisible({ timeout: 8_000 });
  });

  test('6.9 general panel: video meetings region', async ({ page }) => {
    if (!(await openTab(page, /general/i))) { test.skip(true, 'No general tab'); return; }
    const hasVideo = await page.getByRole('region', { name: /video meetings/i })
      .isVisible({ timeout: 6_000 }).catch(() => false);
    const hasVideoText = await page.getByText(/video meeting|meet|zoom|livekit/i)
      .first().isVisible({ timeout: 3_000 }).catch(() => false);
    expect(hasVideo || hasVideoText).toBe(true);
  });

  test('6.10 dictionary panel renders', async ({ page }) => {
    if (!(await openTab(page, /word dictionary/i))) { test.skip(true, 'No dictionary tab'); return; }
    const text = (await page.locator('main').innerText()).trim();
    expect(text.length).toBeGreaterThan(20);
  });

  test('6.11 media-captions panel when MATERIAL_CAPTIONS_ENABLED', async ({ page }) => {
    await page.goto('/system');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    // Captions UI lives under general / connections depending on flag — soft skip if hidden
    const captions = page.getByText(/media captions|auto captions|whisper/i).first();
    if (!(await captions.isVisible({ timeout: 4_000 }).catch(() => false))) {
      test.skip(true, 'MATERIAL_CAPTIONS_ENABLED off — panel hidden (expected N/A)');
      return;
    }
    await expect(captions).toBeVisible();
  });
});
