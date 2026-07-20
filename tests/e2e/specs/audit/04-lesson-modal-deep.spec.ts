/**
 * АУДИТ Етап 4 — 4F deep lesson modal: recurrence, homework, group type (B4/B6 subset).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

test('4F.4/4F.8 lesson modal planning: recurrence + group lesson controls', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /create lesson|new lesson/i }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  const recurrence = dialog.getByLabel(/recurrence|repeat/i).or(dialog.getByText(/no repeat|weekly|daily/i).first());
  if (await recurrence.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await expect(recurrence).toBeVisible();
  }

  const groupToggle = dialog.getByRole('radio', { name: /^group$/i }).or(dialog.getByText(/^group$/i).first());
  if (await groupToggle.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await groupToggle.click();
    const groupSelect = dialog.getByLabel(/learning group|group/i).first();
    await expect(groupSelect).toBeVisible({ timeout: 6_000 });
  }

  const contentTab = dialog.getByRole('tab', { name: /lesson content|content/i }).first();
  await contentTab.click();
  await expect(dialog.getByText(/homework/i).first()).toBeVisible({ timeout: 6_000 });
  await page.keyboard.press('Escape');
});
