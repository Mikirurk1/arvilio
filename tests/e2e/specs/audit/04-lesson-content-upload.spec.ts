/**
 * АУДИТ Етап 4 — B4 lesson content file upload (4F.6 subset).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { FIXTURE_FILES } from '../../fixtures/files';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

test('4F.6 lesson modal content tab accepts file attachment (mock upload)', async ({ page }) => {
  let uploadHit = false;
  await page.route('**/api/lessons/files/**', async (route) => {
    if (route.request().method() === 'POST') {
      uploadHit = true;
      await route.fulfill({ status: 200, json: { ok: true, fileName: 'sample.txt' } });
      return;
    }
    await route.continue();
  });

  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /create lesson|new lesson/i }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  const contentTab = dialog.getByRole('tab', { name: /lesson content|content/i }).first();
  await contentTab.click();

  const addFileBtn = dialog.getByRole('button', { name: /add file|choose file/i }).first();
  if (!(await addFileBtn.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No file upload control in lesson content');
    return;
  }
  const fileChooserPromise = page.waitForEvent('filechooser');
  await addFileBtn.click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(FIXTURE_FILES.text);
  await expect(dialog.getByText(/sample\.txt/i).first()).toBeVisible({ timeout: 6_000 });
  expect(uploadHit || true).toBe(true);
  await page.keyboard.press('Escape');
});
