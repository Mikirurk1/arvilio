/**
 * Stage 5 — Admin role product tour (UC3, UC8 billing copy).
 */
import { STATE, test, expect } from '../../fixtures/auth';
import { expectArvi } from '../../helpers/a11y';
import {
  advanceTourToHub,
  advanceTourUntilCardMatches,
  onlyProject,
  openTourOnDashboard,
  skipTour,
  tourDialog,
} from '../../helpers/tour';

test.use({ storageState: STATE.admin });
onlyProject('admin');

test.describe.configure({ mode: 'serial' });

test('welcome shows Arvi greet and admin workspace copy', async ({ page }) => {
  await openTourOnDashboard(page);
  await expect(tourDialog(page).getByRole('heading', { level: 2 })).toHaveText(
    /your school workspace/i,
  );
  await expectArvi(page, 'greet');
});

test('billing step explains subscription vs student payment (UC8)', async ({ page }) => {
  await openTourOnDashboard(page);
  await advanceTourUntilCardMatches(page, /school subscription/i);
  await expect(tourDialog(page)).toContainText(/Billing \(Subscription in the nav\)/i);
  await expect(tourDialog(page)).toContainText(/not where students buy lesson packs/i);
});

test('skip completes tour', async ({ page }) => {
  await openTourOnDashboard(page);
  await skipTour(page);
  await page.reload();
  await expect(tourDialog(page)).toBeHidden({ timeout: 5_000 });
});

test('Level A finish opens chapter hub', async ({ page }) => {
  test.setTimeout(60_000);
  await openTourOnDashboard(page);
  await advanceTourToHub(page);
  await expect(tourDialog(page)).toHaveAttribute('data-tour-phase', 'hub');
  await expect(page.locator('[data-tour-hub]')).toBeVisible();
  await tourDialog(page).getByRole('button', { name: /finish later/i }).click();
  await expect(tourDialog(page)).toBeHidden({ timeout: 10_000 });
});
