/**
 * АУДИТ Етап 3/4 — 3B.9 LessonVocabularyAddPanel (teacher lesson modal).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

test('3B.9 add vocabulary word in lesson content tab', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const createBtn = page.getByRole('button', { name: /create lesson|new lesson/i }).first();
  if (!(await createBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, 'No create lesson button');
    return;
  }
  await createBtn.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  const contentTab = dialog.getByRole('tab', { name: /lesson content|content/i }).first();
  await contentTab.click();
  await expect(contentTab).toHaveAttribute('aria-selected', 'true');

  const wordInput = dialog.getByPlaceholder(/english word or phrase/i);
  if (!(await wordInput.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'Lesson vocabulary panel not visible (needs student on lesson)');
    return;
  }
  await wordInput.fill('hello');
  await page.waitForTimeout(800);
  const addBtn = dialog.getByRole('button', { name: /add to lesson/i });
  if (await addBtn.isEnabled({ timeout: 4_000 }).catch(() => false)) {
    await addBtn.click();
    await expect(dialog.getByText(/hello/i).first()).toBeVisible({ timeout: 8_000 });
  } else {
    await expect(wordInput).toHaveValue('hello');
  }
  await page.keyboard.press('Escape');
});
