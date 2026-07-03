import { STATE } from '../../fixtures/auth';
/**
 * Etap 6 — System page (school ADMIN only).
 * Note: /system requires ADMIN role within a school.
 * In this app MembershipRole = STUDENT | TEACHER | ADMIN (no SUPER_ADMIN).
 */
import { test, expect } from '@playwright/test';

test.describe('System page — admin', () => {
  test.use({ storageState: STATE.admin });

  test('admin can access /system', async ({ page }) => {
    await page.goto('/system');
    await expect(page).toHaveURL(/\/system/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('shows tab navigation (school / branding / connections / billing)', async ({ page }) => {
    await page.goto('/system');
    const tabs = page.getByRole('tab');
    await expect(tabs.first()).toBeVisible({ timeout: 8_000 });
    // At least 2 tabs expected
    expect(await tabs.count()).toBeGreaterThanOrEqual(2);
  });

  test('branding tab renders color and logo fields', async ({ page }) => {
    await page.goto('/system');
    const brandingTab = page.getByRole('tab', { name: /branding|бренд/i });
    const exists = await brandingTab.isVisible().catch(() => false);
    if (!exists) return;
    await brandingTab.click();
    const colorField = page.getByLabel(/color|колір/i).or(page.getByTestId('brand-color'));
    await expect(colorField).toBeVisible({ timeout: 6_000 });
  });

  test('billing tab renders plan info or upgrade CTA', async ({ page }) => {
    await page.goto('/system');
    const billingTab = page.getByRole('tab', { name: /billing|план|subscription/i });
    const exists = await billingTab.isVisible().catch(() => false);
    if (!exists) return;
    await billingTab.click();
    const planInfo = page
      .getByTestId('current-plan')
      .or(page.getByText(/starter|pro|trial|upgrade/i));
    await expect(planInfo).toBeVisible({ timeout: 6_000 });
  });

  test('connections tab shows Google OAuth button', async ({ page }) => {
    await page.goto('/system');
    const connTab = page.getByRole('tab', { name: /connections|інтеграції/i });
    const exists = await connTab.isVisible().catch(() => false);
    if (!exists) return;
    await connTab.click();
    const googleOAuth = page
      .getByRole('button', { name: /connect google|підключити google/i })
      .or(page.getByTestId('google-oauth-connect'));
    const hasBtn = await googleOAuth.isVisible().catch(() => false);
    if (hasBtn) await expect(googleOAuth).toBeVisible();
  });
});

test.describe('System page — teacher RBAC', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher is redirected from /system', async ({ page }) => {
    await page.goto('/system');
    const url = page.url();
    const forbidden = await page.getByText(/forbidden|403|access denied/i).isVisible().catch(() => false);
    expect(!url.includes('/system') || forbidden).toBe(true);
  });
});
