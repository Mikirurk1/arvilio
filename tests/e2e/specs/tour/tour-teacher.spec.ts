/**
 * Stage 5 / Tour v3 — Teacher role product tour (UC2) + chapter hub.
 */
import { STATE, test, expect } from '../../fixtures/auth';
import { expectArvi } from '../../helpers/a11y';
import {
  advanceTourToHub,
  openTourOnDashboard,
  onlyProject,
  skipTour,
  tourDialog,
} from '../../helpers/tour';

test.use({ storageState: STATE.teacher });
onlyProject('teacher');

test('welcome shows Arvi greet and teacher copy', async ({ page }) => {
  await openTourOnDashboard(page);
  await expect(tourDialog(page).getByRole('heading', { level: 2 })).toHaveText(
    /welcome, teacher/i,
  );
  await expectArvi(page, 'greet');
  await expect(tourDialog(page)).toContainText(/materials, students, and feedback/i);
});

test('skip completes tour', async ({ page }) => {
  await openTourOnDashboard(page);
  await skipTour(page);
  await page.reload();
  await expect(tourDialog(page)).toBeHidden({ timeout: 5_000 });
});

test('Level A finish opens chapter hub; skip chapter returns to hub', async ({ page }) => {
  await openTourOnDashboard(page);
  await advanceTourToHub(page);
  const tour = tourDialog(page);
  await expect(tour).toHaveAttribute('data-tour-phase', 'hub');
  await expect(page.locator('[data-tour-hub]')).toBeVisible();
  await expect(tour.getByRole('heading', { level: 2 })).toHaveText(/try it yourself/i);

  const firstStart = tour.locator('[data-tour-chapter][data-tour-chapter-action="start"]').first();
  await expect(firstStart).toBeVisible();
  const chapterId = await firstStart.getAttribute('data-tour-chapter');
  expect(chapterId).toBeTruthy();
  await firstStart.click();
  await expect(tour).toHaveAttribute('data-tour-phase', 'chapter');

  await tour.getByRole('button', { name: /skip chapter/i }).click();
  await expect(tour).toHaveAttribute('data-tour-phase', 'hub');
  await expect(
    tour.locator(`[data-tour-chapter="${chapterId}"][data-tour-chapter-status="skipped"]`),
  ).toBeVisible();
  await expect(
    tour.locator(`[data-tour-chapter="${chapterId}"][data-tour-chapter-action="replay"]`),
  ).toHaveText(/replay/i);
});

test('hub Replay restarts a skipped chapter (v3.1)', async ({ page }) => {
  await openTourOnDashboard(page);
  await advanceTourToHub(page);
  const tour = tourDialog(page);

  const chapterBtn = tour.locator('[data-tour-chapter="tea-ch-materials"]');
  await chapterBtn.click();
  await expect(tour).toHaveAttribute('data-tour-phase', 'chapter');
  await tour.getByRole('button', { name: /skip chapter/i }).click();
  await expect(tour).toHaveAttribute('data-tour-phase', 'hub');

  const replay = tour.locator(
    '[data-tour-chapter="tea-ch-materials"][data-tour-chapter-action="replay"]',
  );
  await expect(replay).toBeVisible();
  await replay.click();
  await expect(tour).toHaveAttribute('data-tour-phase', 'chapter');
  await expect(tour.getByRole('heading', { level: 2 })).toContainText(/materials/i);
});

test('hub Finish later completes tour', async ({ page }) => {
  await openTourOnDashboard(page);
  await advanceTourToHub(page);
  const complete = page.waitForResponse(
    (r) =>
      r.url().includes('/api/onboarding/tour/complete') &&
      r.request().method() === 'POST',
    { timeout: 15_000 },
  );
  await tourDialog(page).getByRole('button', { name: /finish later/i }).click();
  await complete;
  await expect(tourDialog(page)).toBeHidden({ timeout: 10_000 });
});

/** UC10 — soft-complete First lesson: open modal, no save required. */
test('soft-complete First lesson chapter via New lesson modal', async ({ page }) => {
  test.setTimeout(90_000);
  await openTourOnDashboard(page);
  await advanceTourToHub(page);
  const tour = tourDialog(page);

  await tour.locator('[data-tour-chapter="tea-ch-first-lesson"]').click();
  await expect(tour).toHaveAttribute('data-tour-phase', 'chapter');

  // Soft step 1: open lesson modal (overlay must allow clicks through).
  const createBtn = page.locator('[data-tour-anchor="header-create-lesson"]');
  await expect(createBtn).toBeVisible({ timeout: 10_000 });
  await createBtn.click();
  await expect(page.locator('[data-tour-anchor="lesson-modal"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(tour.locator('[data-tour-quest-hint]')).toContainText(/detected/i, {
    timeout: 10_000,
  });
  await tour.getByRole('button', { name: /^(next|continue)$/i }).click();

  // Soft step 2: setup panel already visible inside modal.
  await expect(page.locator('[data-tour-anchor="lesson-modal-setup"]')).toBeVisible();
  await expect(tour.locator('[data-tour-quest-hint]')).toContainText(/detected/i, {
    timeout: 10_000,
  });
  await tour.getByRole('button', { name: /^finish$/i }).click();

  await expect(tour).toHaveAttribute('data-tour-phase', 'hub');
  await expect(
    tour.locator(
      '[data-tour-chapter="tea-ch-first-lesson"][data-tour-chapter-status="done"]',
    ),
  ).toBeVisible();

  // Cancel without saving is enough for soft tour.
  await page.keyboard.press('Escape');
});
