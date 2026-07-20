import { expect, test, type Page } from '@playwright/test';

/** Prevent the first-login product tour from intercepting clicks during E2E. */
export async function suppressTour(page: Page) {
  await page.route('**/api/onboarding/tour**', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ json: { completed: true } });
      return;
    }
    void route.continue();
  });
}

/** Clear persisted tour completion so the overlay can open again. */
export async function resetTour(page: Page) {
  const res = await page.request.post('/api/onboarding/tour/reset');
  expect(res.ok(), `tour reset failed: ${res.status()}`).toBeTruthy();
}

export function tourDialog(page: Page) {
  return page.getByRole('dialog', { name: /product tour/i });
}

/** Reset tour server-side and open dashboard until the tour dialog appears. */
export async function openTourOnDashboard(page: Page) {
  await resetTour(page);
  await page.goto('/dashboard');
  await expect(tourDialog(page)).toBeVisible({ timeout: 15_000 });
}

/**
 * Skip / finish the tour from any phase:
 * Level A Skip, hub Finish later, or chapter Skip chapter.
 */
export async function skipTour(page: Page) {
  const tour = tourDialog(page);
  const complete = page.waitForResponse(
    (r) =>
      r.url().includes('/api/onboarding/tour/complete') &&
      r.request().method() === 'POST',
    { timeout: 15_000 },
  );
  const skipBtn = tour
    .getByRole('button', { name: /^(skip|finish later|skip chapter)$/i })
    .first();
  await expect(skipBtn).toBeVisible();
  await skipBtn.click();
  await complete;
  await expect(tour).toBeHidden({ timeout: 10_000 });
}

/** Click Next on the current Level A step. */
export async function clickTourNext(page: Page) {
  const tour = tourDialog(page);
  const next = tour.getByRole('button', { name: /^next$/i });
  await expect(next).toBeVisible();
  await next.click();
}

/**
 * Advance Level A until the last step, then click Next to enter the chapter hub.
 */
export async function advanceTourToHub(page: Page, maxSteps = 120) {
  const tour = tourDialog(page);
  for (let i = 0; i < maxSteps; i++) {
    await expect(tour).toBeVisible();
    const hub = page.locator('[data-tour-hub]');
    if (await hub.isVisible().catch(() => false)) return;
    const phase = await tour.getAttribute('data-tour-phase');
    if (phase === 'hub') return;
    const next = tour.getByRole('button', { name: /^(next|continue)$/i });
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(200);
      continue;
    }
    throw new Error(`Could not reach tour hub after ${i + 1} steps`);
  }
  throw new Error(`Exceeded ${maxSteps} tour steps without reaching hub`);
}

/**
 * Advance Level A steps until tour card text matches `pattern`.
 * Does not click Finish / Continue on the last step.
 */
export async function advanceTourUntilCardMatches(
  page: Page,
  pattern: RegExp,
  maxSteps = 80,
) {
  const tour = tourDialog(page);
  for (let i = 0; i < maxSteps; i++) {
    await expect(tour).toBeVisible();
    const card = page.locator('[data-tour-card]');
    const text = await card.innerText();
    if (pattern.test(text)) return;
    const next = tour.getByRole('button', { name: /^next$/i });
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(250);
      continue;
    }
    throw new Error(`Tour card did not match ${pattern} after ${i + 1} steps:\n${text}`);
  }
  throw new Error(`Exceeded ${maxSteps} tour steps without matching ${pattern}`);
}

/** Profile → Account → Replay tour (requires tour already completed or reset). */
export async function replayTourFromProfile(page: Page) {
  await page.goto('/profile');
  await page.getByRole('tab', { name: /^account$/i }).click();
  await page.getByRole('button', { name: /replay tour|пройти тур знову/i }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\/|$|\?)/, { timeout: 15_000 });
  await expect(tourDialog(page)).toBeVisible({ timeout: 15_000 });
}

/** Limit tour specs to one Playwright project (avoids parallel cross-role tour state races). */
export function onlyProject(projectName: string) {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== projectName, `Runs only in ${projectName} project`);
  });
}
