/**
 * АУДИТ Етап 4 — 4C.3 empty students roster (jest-teacher-empty).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacherEmpty });

test('4C.3 students empty: No students in this scope', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/students');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByText(/no students in this scope|no students are currently assigned|no students found/i).first(),
  ).toBeVisible({ timeout: 10_000 });
});
