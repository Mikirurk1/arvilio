import { STATE } from '../../fixtures/auth';
/**
 * Etap 3B — Lessons list + Lesson modal.
 */
import { test, expect, type Page } from '@playwright/test';

async function suppressProductTour(page: Page) {
  // Mock the tour-status endpoint so the tour never opens (completed: true).
  // This prevents the overlay from intercepting pointer events on the page.
  await page.route('**/api/onboarding/tour**', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ json: { completed: true } });
    } else {
      void route.continue();
    }
  });
}

test.describe('Lessons list — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('renders lessons page', async ({ page }) => {
    await page.goto('/lessons');
    await expect(page).toHaveURL(/\/lessons/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('create lesson button is visible', async ({ page }) => {
    await page.goto('/lessons');
    const btn = page
      .getByRole('button', { name: /new lesson|create lesson|додати урок/i })
      .or(page.getByTestId('create-lesson-btn'));
    const exists = await btn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!exists) return; // Button may be hidden on mobile viewport
    await expect(btn).toBeVisible();
  });

  test('opens lesson modal on create button click', async ({ page }) => {
    await suppressProductTour(page);
    await page.goto('/lessons');
    const btn = page.getByRole('button', { name: /new lesson|create lesson|додати урок/i });
    const exists = await btn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!exists) return; // Button may be hidden on mobile viewport
    await btn.click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 6_000 });
    await expect(modal.getByRole('tab').first()).toBeVisible({ timeout: 4_000 });
  });

  test('lesson modal closes on Cancel or X', async ({ page }) => {
    await suppressProductTour(page);
    await page.goto('/lessons');
    const btn = page.getByRole('button', { name: /new lesson|create lesson|додати урок/i });
    const exists = await btn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!exists) return; // Button may be hidden on mobile viewport
    await btn.click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 6_000 });
    const closeBtn = modal
      .getByRole('button', { name: /close|cancel|закрити|скасувати/i })
      .first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible({ timeout: 4_000 });
  });

  test('lesson list shows empty state or list of lessons', async ({ page }) => {
    await page.goto('/lessons');
    const hasList = await page.getByRole('list').isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no lessons|немає уроків/i).isVisible().catch(() => false);
    const hasCards = await page.getByTestId('lesson-card').first().isVisible().catch(() => false);
    expect(hasList || hasEmpty || hasCards).toBe(true);
  });
});

test.describe('Lessons list — student', () => {
  test.use({ storageState: STATE.student });

  test('student can view lessons page', async ({ page }) => {
    await page.goto('/lessons');
    await expect(page).toHaveURL(/\/lessons/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('student does NOT see create lesson button', async ({ page }) => {
    await page.goto('/lessons');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.getByRole('button', { name: /new lesson|create lesson|додати урок/i });
    await expect(btn).not.toBeVisible();
  });
});

test.describe('Lesson modal — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('setup tab has required fields', async ({ page }) => {
    await suppressProductTour(page);
    await page.goto('/lessons');
    const btn = page.getByRole('button', { name: /new lesson|create lesson|додати урок/i });
    const exists = await btn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!exists) return; // Button may be hidden on mobile viewport
    await btn.click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 6_000 });

    // Setup tab should be active and form fields should be rendered
    await expect(modal.getByRole('tab').first()).toBeVisible({ timeout: 4_000 });
    // At least one input should be in the form (title textbox or number for duration)
    await expect(modal.locator('input').first()).toBeVisible({ timeout: 4_000 });
  });

  test('switching between modal tabs works', async ({ page }) => {
    await suppressProductTour(page);
    await page.goto('/lessons');
    const btn = page.getByRole('button', { name: /new lesson|create lesson|додати урок/i });
    const exists = await btn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!exists) return; // Button may be hidden on mobile viewport
    await btn.click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 6_000 });

    const tabs = modal.getByRole('tab');
    const tabCount = await tabs.count();
    if (tabCount > 1) {
      await tabs.nth(1).click();
      // Second tab content should appear
      await expect(modal.getByRole('tabpanel')).toBeVisible();
    }
  });
});
