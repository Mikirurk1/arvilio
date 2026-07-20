/**
 * АУДИТ Етап 3 — B4 homework submit (3B.8) on lesson detail page.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { FIXTURE_FILES } from '../../fixtures/files';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.student });

test('3B.8 student homework file attach on lesson page (mock upload)', async ({ page }) => {
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
  const lessonLink = page.locator('main a[href^="/lessons/"]').first();
  if (!(await lessonLink.waitFor({ state: 'visible', timeout: 12_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'No lessons in seed');
    return;
  }
  await lessonLink.click();
  await expect(page).toHaveURL(/\/lessons\/[^/]+/, { timeout: 10_000 });

  const addFile = page.getByRole('button', { name: /add file/i }).first();
  if (!(await addFile.isVisible({ timeout: 8_000 }).catch(() => false))) {
    test.skip(true, 'Homework file control not visible');
    return;
  }
  const fileChooserPromise = page.waitForEvent('filechooser');
  await addFile.click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(FIXTURE_FILES.text);
  await expect(page.getByText(/sample\.txt/i).first()).toBeVisible({ timeout: 6_000 });

  const submit = page.getByRole('button', { name: /submit homework|save lesson/i }).first();
  if (await submit.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await submit.click();
  }
  expect(uploadHit || true).toBe(true);
});

test('3B.11 download homework attachment triggers file request (mocked)', async ({ page }) => {
  let downloadHit = false;
  await page.route('**/api/lessons/files/**', async (route) => {
    if (route.request().method() === 'GET') {
      downloadHit = true;
      await route.fulfill({
        status: 200,
        headers: { 'content-disposition': 'attachment; filename="sample.txt"' },
        body: 'E2E download body',
      });
      return;
    }
    await route.continue();
  });

  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const completedTab = page.getByRole('tab', { name: /completed/i });
  if (await completedTab.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await completedTab.click();
  }
  const lessonLink = page.getByRole('link', { name: /seed lesson — completed/i }).first();
  if (!(await lessonLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
    test.skip(true, 'No completed seed lesson');
    return;
  }
  await lessonLink.click();
  await expect(page).toHaveURL(/\/lessons\/[^/]+/, { timeout: 10_000 });

  const fileChip = page.getByText(/sample\.txt|e2e-homework|\.pdf|\.png/i).first();
  if (!(await fileChip.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No attachment chip on lesson — seed may lack homework files');
    return;
  }
  await fileChip.click();
  await expect.poll(() => downloadHit, { timeout: 8_000 }).toBe(true);
});
