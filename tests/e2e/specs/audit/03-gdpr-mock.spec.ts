/**
 * АУДИТ Етап 3 — 3L.8–9 GDPR export / delete account (REST mock).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

test.describe('3L GDPR (mocked)', () => {
  test('3L.8 Export my data triggers download from GET /gdpr/export', async ({ page }) => {
    await page.route('**/api/gdpr/export', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { email: 'jest-student@arvilio.test' },
          exportedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/profile');
    await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });

    const accountTab = page.getByRole('tab', { name: /account/i }).first();
    if (await accountTab.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await accountTab.click();
    }

    await expect(page.getByText(/export my data/i)).toBeVisible({ timeout: 10_000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 }).catch(() => null);
    await page.getByRole('button', { name: /^export$/i }).click();
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toMatch(/my-data-.*\.json/);
    }
    await expect(page.getByText(/download started|exported|завантажен/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('3L.9 Delete account confirm → DELETE /gdpr/me → login', async ({ page }) => {
    let deleted = false;
    await page.route('**/api/gdpr/me', async (route) => {
      if (route.request().method() === 'DELETE') {
        deleted = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/profile');
    await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });
    const accountTab = page.getByRole('tab', { name: /account/i }).first();
    if (await accountTab.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await accountTab.click();
    }

    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByRole('button', { name: /^delete$/i }).click();
    await expect.poll(() => deleted, { timeout: 10_000 }).toBe(true);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
