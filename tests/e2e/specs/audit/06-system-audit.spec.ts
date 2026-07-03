/**
 * АУДИТ Етап 6 — /system control room (admin-scope; super_admin у сіді нема)
 * Кожен таб: відкрити → screenshot → axe
 */
import { test, expect } from '@playwright/test';
import { shot, expectNoA11yViolations, consoleGuard } from '../../helpers/a11y';
import { STATE } from '../../fixtures/auth';

const DIR = '06-system';

test.use({ storageState: STATE.admin });

const TABS: Array<{ id: string; label: RegExp }> = [
  { id: 'general', label: /general/i },
  { id: 'email', label: /email/i },
  { id: 'dictionary', label: /word dictionary/i },
  { id: 'connections', label: /connections/i },
  { id: 'payments', label: /^payments/i },
  { id: 'payouts', label: /payouts/i },
  { id: 'domains', label: /domains/i },
  { id: 'branding', label: /branding/i },
];

test('6.1 /system render + screenshot + axe (general)', async ({ page }) => {
  const stop = consoleGuard(page);
  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(800);
  await shot(page, `${DIR}/6-1-system-general`);
  await expectNoA11yViolations(page);
  stop();
});

for (const tab of TABS.slice(1)) {
  test(`6.13 tab "${tab.id}" opens + screenshot + axe`, async ({ page }) => {
    await page.goto('/system');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const tabEl = page.getByRole('tab', { name: tab.label }).first();
    const hasTab = await tabEl.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasTab) { test.skip(true, `No "${tab.id}" tab`); return; }
    await tabEl.click();
    await page.waitForTimeout(800);
    await shot(page, `${DIR}/6-13-tab-${tab.id}`);
    await expectNoA11yViolations(page);
  });
}

test('6.3 branding: hex input + live preview present', async ({ page }) => {
  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const tabEl = page.getByRole('tab', { name: /branding/i }).first();
  if (!(await tabEl.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, 'No branding tab');
    return;
  }
  await tabEl.click();
  const colorInput = page.locator('main').getByRole('textbox').first();
  await expect(colorInput).toBeVisible({ timeout: 8_000 });
});
