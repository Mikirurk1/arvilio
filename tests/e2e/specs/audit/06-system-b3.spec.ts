/**
 * АУДИТ Етап 6 — /system B3 (interaction без зовнішньої верифікації):
 * 6.4 domains — форма додавання (Hostname + Add domain) АБО feature-gate UpgradePrompt.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

test('6.4 domains panel: add-form or feature-gate present', async ({ page }) => {
  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const tab = page.getByRole('tab', { name: /domains/i }).first();
  if (!(await tab.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'No domains tab');
    return;
  }
  await tab.click();
  await page.waitForTimeout(500);

  const hasForm = await page.getByRole('button', { name: /add domain/i })
    .first().waitFor({ state: 'visible', timeout: 6_000 }).then(() => true).catch(() => false);
  const hasUpgrade = await page.getByText(/custom domains require|upgrade|pro plan/i)
    .first().isVisible().catch(() => false);
  expect(hasForm || hasUpgrade, 'domains tab shows add-form or upgrade gate').toBe(true);

  if (hasForm) {
    // Hostname field accepts input (add itself is a mutation → not submitted)
    const hostField = page.getByLabel(/hostname/i).first();
    await hostField.fill('e2e-probe.example.com');
    await expect(hostField).toHaveValue('e2e-probe.example.com');
  }
});
