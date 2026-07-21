/**
 * Stage 5 — Student role product tour (UC1, UC7).
 * Requires seeded auth + live API (`PLAYWRIGHT_SKIP_WEBSERVER=1` when dev is up).
 */
import { STATE, test, expect } from '../../fixtures/auth';
import { expectArvi } from '../../helpers/a11y';
import {
  advanceTourToHub,
  advanceTourUntilCardMatches,
  clickTourNext,
  onlyProject,
  openTourOnDashboard,
  replayTourFromProfile,
  resetTour,
  skipTour,
  tourDialog,
} from '../../helpers/tour';

test.use({ storageState: STATE.student });
onlyProject('student');

test.describe.configure({ mode: 'serial' });

test('welcome shows Arvi greet', async ({ page }) => {
  await openTourOnDashboard(page);
  await expect(tourDialog(page).getByRole('heading', { level: 2 })).toHaveText(
    /welcome.*arvi/i,
  );
  await expectArvi(page, 'greet');
});

test('payment step distinguishes lesson balance from school subscription (UC7)', async ({
  page,
}) => {
  await openTourOnDashboard(page);
  expect(await advanceTourUntilCardMatches(page, /lesson balance|prepaid lessons/i)).toBe(true);
  await expect(tourDialog(page)).toContainText(/not.*subscription|saas/i);
});

test('skip completes tour and persists', async ({ page }) => {
  await openTourOnDashboard(page);
  await skipTour(page);
  await page.reload();
  await expect(tourDialog(page)).toBeHidden({ timeout: 5_000 });
});

test('replay from Profile → Account reopens tour', async ({ page }) => {
  test.setTimeout(60_000);
  await openTourOnDashboard(page);
  await skipTour(page);
  await replayTourFromProfile(page);
  await expect(page).toHaveURL(/\/dashboard(?:\/|$|\?)/);
  await expectArvi(page, 'greet');
  await clickTourNext(page);
  await expect(page).toHaveURL(/\/dashboard(?:\/|$|\?)/);
  await skipTour(page);
});

test('first-login from Profile redirects to dashboard and Level A soft-navs', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await resetTour(page);
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/dashboard(?:\/|$|\?)/, { timeout: 15_000 });
  await expect(tourDialog(page)).toBeVisible({ timeout: 15_000 });
  await expectArvi(page, 'greet');
  expect(await advanceTourUntilCardMatches(page, /lessons list|highlight cards|next & previous/i)).toBe(true);
  await expect(page).toHaveURL(/\/lessons(?:\/|$|\?)/, { timeout: 15_000 });
  await skipTour(page);
});

test('Level A finish opens chapter hub', async ({ page }) => {
  test.setTimeout(180_000);
  await openTourOnDashboard(page);
  await advanceTourToHub(page);
  await expect(tourDialog(page)).toHaveAttribute('data-tour-phase', 'hub');
  await expect(page.locator('[data-tour-hub]')).toBeVisible();
  await tourDialog(page).getByRole('button', { name: /finish later/i }).click();
  await expect(tourDialog(page)).toBeHidden({ timeout: 10_000 });
});
