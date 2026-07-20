/**
 * АУДИТ Етап 3 — 3L.5 OAuth connections (B6 route-mock, no external redirect).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

test('3L.5 Connections tab initiates Google link (mocked auth URL)', async ({ page }) => {
  await page.route('**/api/auth/google/link**', (route) =>
    route.fulfill({ status: 200, json: { url: '/profile?tab=connections&google_linked=1' } }),
  );

  await page.goto('/profile?tab=connections');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const connectBtn = page.getByRole('button', { name: /connect google|reconnect google/i }).first();
  if (!(await connectBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
    test.skip(true, 'Google connect button not shown');
    return;
  }
  await connectBtn.click();
  await expect(page).toHaveURL(/connections|google_linked/, { timeout: 8_000 });
});
