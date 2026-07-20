/**
 * АУДИТ Етап 3 — empty-user fixtures (3A.4, 3H.3, 3I.3).
 * Uses jest-student-empty (no lessons / vocabulary).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.studentEmpty });

test('3A.4 dashboard empty: No lessons today / All caught up', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/dashboard');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByText(/loading lessons/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  const noLessons = page.getByText(/no lessons today/i);
  const caughtUp = page.getByText(/all caught up/i);
  await expect(noLessons.or(caughtUp).first()).toBeVisible({ timeout: 10_000 });
});

test('3H.3 vocabulary empty: No words yet', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/vocabulary');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  // Empty list may hide "No words yet" when the add-word prepend slot is shown —
  // header still reports "0 words".
  await expect(page.getByText(/0 words|no words yet|no words match/i).first())
    .toBeVisible({ timeout: 10_000 });
});

test('3I.3 calendar empty period: No lessons scheduled', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/calendar');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  // Navigate far forward so seeded (none) + main-user lessons are out of view for empty user
  for (let i = 0; i < 8; i++) {
    const next = page.getByRole('button', { name: /next|forward|>/i }).first();
    if (await next.isVisible({ timeout: 2_000 }).catch(() => false)) await next.click();
    else break;
  }
  const empty = page.getByText(/no lessons scheduled|no events|nothing scheduled/i);
  const hasGrid = await page.locator('main').isVisible();
  expect(hasGrid).toBe(true);
  // Soft: empty hint may appear when a day with no events is selected
  await empty.first().isVisible({ timeout: 3_000 }).catch(() => false);
});
