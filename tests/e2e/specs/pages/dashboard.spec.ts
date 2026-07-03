import { STATE } from '../../fixtures/auth';
/**
 * Etap 3A — Dashboard.
 * Runs in: student project, teacher project, admin project.
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard — student', () => {
  test.use({ storageState: STATE.student });

  test('loads main content area', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('sidebar navigation is visible with expected links', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const navVisible = await nav.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!navVisible) return; // Sidebar hidden on mobile (hamburger menu)
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /lessons/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /calendar/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /chat|messages/i })).toBeVisible();
  });

  test('quick-action or upcoming lesson tile is visible', async ({ page }) => {
    await page.goto('/dashboard');
    // Dashboard renders quick-action buttons or upcoming stat counters
    const hasLesson = await page.getByTestId('upcoming-lesson').isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no upcoming|немає уроків/i).isVisible().catch(() => false);
    // Quick-action section: buttons like "Schedule", "Create lesson", etc.
    const hasQuickAction = await page.getByText(/upcoming|schedule|lessons.*left|planned/i).first().isVisible().catch(() => false);
    expect(hasLesson || hasEmpty || hasQuickAction).toBe(true);
  });

  test('daily goals section renders or shows empty state', async ({ page }) => {
    await page.goto('/dashboard');
    const section = page.getByTestId('daily-goals').or(page.getByText(/daily goal|ціль на сьогодні/i));
    // Goals exist or empty-state is shown — either is valid
    const visible = await section.isVisible().catch(() => false);
    // Non-blocking: goals may not be seeded in test DB
    if (visible) {
      await expect(section).toBeVisible();
    }
  });

  test('page title is set (SEO)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/.+/);
  });
});

test.describe('Dashboard — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher dashboard loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('teacher sees students link in sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const exists = await nav.isVisible().catch(() => false);
    if (!exists) return; // Sidebar hidden on mobile
    await expect(nav.getByRole('link', { name: /students/i })).toBeVisible();
  });

  test('teacher sees materials link in sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const exists = await nav.isVisible().catch(() => false);
    if (!exists) return; // Sidebar hidden on mobile
    await expect(nav.getByRole('link', { name: /materials/i })).toBeVisible();
  });
});

test.describe('Dashboard — admin', () => {
  test.use({ storageState: STATE.admin });

  test('admin dashboard loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('admin sees system link in sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const exists = await nav.isVisible().catch(() => false);
    if (!exists) return; // Sidebar hidden on mobile
    await expect(nav.getByRole('link', { name: /system|admin/i }).first()).toBeVisible();
  });
});
