/**
 * АУДИТ Етап 4 — 4G group lessons UI (create group-type lesson in modal).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

test('4G.1 group lesson type selectable in lesson modal (self-cleanup if saved)', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /create lesson|new lesson/i }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  const groupRadio = dialog.getByRole('radio', { name: /^group$/i });
  if (!(await groupRadio.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, 'Group lessons feature off');
    return;
  }
  await groupRadio.click();
  await expect(groupRadio).toHaveAttribute('aria-checked', 'true');

  const groupPicker = dialog.getByLabel(/learning group/i).or(dialog.getByText(/select.*group/i).first());
  if (await groupPicker.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await groupPicker.click();
    const option = page.getByRole('option').first();
    if (await option.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await option.click();
    }
  }
  await page.keyboard.press('Escape');
});
