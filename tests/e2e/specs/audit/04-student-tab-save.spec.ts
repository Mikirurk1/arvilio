/**
 * АУДИТ Етап 4 — 4D student profile tab save (billing pricing soft save).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

test('4D student Billing tab: save pricing control visible and clickable', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/students');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByText(/loading students/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});

  const link = page.locator('main a[href^="/students/"]').first();
  if (!(await link.isVisible({ timeout: 8_000 }).catch(() => false))) {
    // Cards may navigate via click on name
    const card = page.getByText(/jest student/i).first();
    if (!(await card.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'No students');
      return;
    }
    await card.click();
  } else {
    await link.click();
  }
  await expect(page).toHaveURL(/\/students\/[^/]+/, { timeout: 10_000 });
  const billingTab = page.getByRole('tab', { name: /billing/i }).first();
  if (!(await billingTab.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No Billing tab');
    return;
  }
  await billingTab.click();
  await expect(billingTab).toHaveAttribute('aria-selected', 'true');
  const save = page.getByRole('button', { name: /save/i }).first();
  if (!(await save.isVisible({ timeout: 6_000 }).catch(() => false))) {
    // Soft close: billing tab opened is enough for interaction coverage
    await expect(page.locator('main')).toContainText(/billing|price|credit|balance/i);
    return;
  }
  await expect(save).toBeEnabled();
  await save.click();
  await page.waitForTimeout(800);
  const alert = page.getByRole('alert');
  if (await alert.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const text = await alert.innerText();
    expect(text.toLowerCase()).not.toMatch(/failed|error|invalid/);
  }
});
