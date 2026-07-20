/**
 * АУДИТ Етап 6 — 6.5 SMTP verify (B6 route-mock).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

test('6.5 SMTP verify connection shows success (mocked GraphQL)', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    const postData = route.request().postData() ?? '';
    if (postData.includes('verifySmtpConnection')) {
      await route.fulfill({
        json: { data: { verifySmtpConnection: { ok: true, message: 'SMTP connection verified.' } } },
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const emailTab = page.getByRole('tab', { name: /^email$/i }).first();
  if (!(await emailTab.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No Email tab (RBAC)');
    return;
  }
  await emailTab.click();
  await expect(page.getByText(/email \(smtp\)/i)).toBeVisible({ timeout: 8_000 });

  // Wait for settings to hydrate — Verify lives inside the smtp form block.
  const customMode = page.getByRole('radio', { name: /custom smtp/i });
  await expect(customMode).toBeVisible({ timeout: 12_000 });
  await customMode.click();
  await page.locator('#smtp-host').fill('smtp.example.com');

  const verifyBtn = page.getByRole('button', { name: /verify connection/i });
  await expect(verifyBtn).toBeVisible({ timeout: 8_000 });
  await expect(verifyBtn).toBeEnabled({ timeout: 4_000 });
  await verifyBtn.click();
  await expect(page.getByText(/smtp connection verified|verified/i).first()).toBeVisible({ timeout: 10_000 });
});
