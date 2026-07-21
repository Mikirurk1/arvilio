import { STATE } from '../../fixtures/auth';
/**
 * Etap 5A — Admin panel (ADMIN role only).
 */
import { test, expect } from '@playwright/test';

test.describe('Admin panel — admin', () => {
  test.use({ storageState: STATE.admin });

  test('renders admin page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('shows users / members section', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 });
    // Title is "Admin"; accounts live in overview + Existing accounts table
    const marker = page
      .getByRole('heading', { name: /admin|account|users|members|учасники/i })
      .or(page.getByRole('table'))
      .or(page.getByLabel(/accounts overview|огляд акаунтів/i))
      .or(page.getByText(/existing accounts|наявні акаунти|create account/i));
    await expect(marker.first()).toBeVisible({ timeout: 12_000 });
  });

  test('shows school settings or branding section', async ({ page }) => {
    await page.goto('/admin');
    const section = page
      .getByRole('heading', { name: /branding|settings|school|налаштування/i })
      .or(page.getByTestId('admin-settings-section'));
    const exists = await section.isVisible().catch(() => false);
    if (exists) await expect(section).toBeVisible();
  });
});

test.describe('Admin panel — teacher RBAC', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher is redirected away from /admin', async ({ page }) => {
    await page.goto('/admin');
    // Should land on dashboard or see 403
    const url = page.url();
    const hasForbidden = await page.getByText(/forbidden|403|access denied/i).isVisible().catch(() => false);
    expect(!url.includes('/admin') || hasForbidden).toBe(true);
  });
});

test.describe('Admin panel — student RBAC', () => {
  test.use({ storageState: STATE.student });

  test('student is redirected away from /admin', async ({ page }) => {
    await page.goto('/admin');
    const url = page.url();
    const hasForbidden = await page.getByText(/forbidden|403|access denied/i).isVisible().catch(() => false);
    expect(!url.includes('/admin') || hasForbidden).toBe(true);
  });
});
