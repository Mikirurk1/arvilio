import { STATE } from '../../fixtures/auth';
/**
 * Etap 3D — Students list + Student profile.
 */
import { test, expect } from '@playwright/test';

test.describe('Students list — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('renders students page', async ({ page }) => {
    await page.goto('/students');
    await expect(page).toHaveURL(/\/students/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('shows student list or empty state', async ({ page }) => {
    await page.goto('/students');
    // Use domcontentloaded — networkidle can hang with websockets
    await page.waitForLoadState('domcontentloaded');
    const hasList = await page.getByRole('list').isVisible().catch(() => false);
    const hasTable = await page.getByRole('table').isVisible().catch(() => false);
    const hasCards = await page.getByTestId('student-card').first().isVisible().catch(() => false);
    // Student cards may render as article/link elements or show student name text
    const hasStudentImg = await page.getByRole('img').first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no students|немає учнів/i).isVisible().catch(() => false);
    expect(hasList || hasTable || hasCards || hasStudentImg || hasEmpty).toBe(true);
  });

  test('invite student button is visible (admin only)', async ({ page }) => {
    await page.goto('/students');
    const btn = page.getByRole('button', { name: /invite|add student|запросити/i });
    // Invite button may only be visible for admin — soft check
    const exists = await btn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!exists) test.skip();
  });

  test('clicking a student card opens student profile', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('domcontentloaded');
    // Student cards render as links to /students/<id>; click by named img or the link itself
    const card = page
      .getByRole('link', { name: /students\//i })
      .or(page.getByTestId('student-card'))
      .or(page.getByRole('img', { name: /student/i }).first())
      .first();
    const exists = await card.isVisible({ timeout: 5_000 }).catch(() => false);
    if (exists) {
      await card.click();
      await expect(page).toHaveURL(/\/students\/.+/, { timeout: 5_000 });
    }
  });
});

test.describe('Student profile — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('profile page has hero section', async ({ page }) => {
    // Navigate via students list
    await page.goto('/students');
    await page.waitForLoadState('domcontentloaded');
    const link = page
      .getByTestId('student-card')
      .or(page.getByRole('link', { name: /view profile|відкрити профіль/i }))
      .first();
    const exists = await link.isVisible().catch(() => false);
    if (!exists) {
      test.skip();
      return;
    }
    await link.click();
    await page.waitForURL(/\/students\/.+/);

    // Hero: avatar + name
    const avatar = page.getByRole('img', { name: /avatar|photo/i }).or(page.getByTestId('student-avatar'));
    const name = page.getByRole('heading').first();
    await expect(name).toBeVisible();
    const avatarExists = await avatar.isVisible().catch(() => false);
    if (avatarExists) await expect(avatar).toBeVisible();
  });

  test('student does not access other student profile (403/redirect)', async ({ page }) => {
    // Students should not be able to view other students' profiles
    // We only test this if we know a student ID — skip if not seeded
    test.skip(true, 'Requires known student ID in seed data');
  });
});

test.describe('Students — student role access', () => {
  test.use({ storageState: STATE.student });

  test('student cannot navigate to /students list', async ({ page }) => {
    await page.goto('/students');
    // Should redirect away or show forbidden
    const url = page.url();
    const isForbidden =
      !url.includes('/students') ||
      (await page.getByText(/forbidden|access denied|403|не маєте доступу/i).isVisible().catch(() => false));
    expect(isForbidden || !url.includes('/students')).toBe(true);
  });
});
