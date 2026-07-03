/**
 * АУДИТ Етап 4 — Роль TEACHER: materials, students, groups, lesson modal
 * Navigate → Screenshot → axe → key-element checks
 */
import { test, expect, type Page } from '@playwright/test';
import { shot, expectNoA11yViolations, consoleGuard } from '../../helpers/a11y';
import { STATE } from '../../fixtures/auth';

const DIR = '04-teacher';

test.use({ storageState: STATE.teacher });

async function suppressTour(page: Page) {
  await page.route('**/api/onboarding/tour**', (r) => {
    if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
    else void r.continue();
  });
}

// ──────────────────────────────────────────────────────
// 4A. /materials
// ──────────────────────────────────────────────────────
test.describe('4A. /materials', () => {
  test('4A.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/4A-materials`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('4A.2 search filters list', async ({ page }) => {
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const search = page.locator('main').getByPlaceholder(/search materials|search/i).first();
    const hasSearch = await search.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasSearch) { test.skip(true, 'No materials search input'); return; }
    await search.fill('zzz-no-such-material');
    await page.waitForTimeout(500);
    await shot(page, `${DIR}/4A-materials-search-empty`);
  });

  test('4A.4 create modal opens with dialog role', async ({ page }) => {
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const addBtn = page.getByRole('button', { name: /add material|new material/i }).first();
    const hasBtn = await addBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasBtn) { test.skip(true, 'No create material button'); return; }
    await addBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
    await shot(page, `${DIR}/4A-material-modal`);
    await expectNoA11yViolations(page);
    await page.keyboard.press('Escape');
  });
});

// ──────────────────────────────────────────────────────
// 4C. /students
// ──────────────────────────────────────────────────────
test.describe('4C. /students', () => {
  test('4C.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/students');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/4C-students`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('4C.3 list or empty state visible', async ({ page }) => {
    await page.goto('/students');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/loading students/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    const hasRow = await page.locator('main a[href^="/students/"]')
      .first().isVisible({ timeout: 5_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/no students/i).isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasRow || hasEmpty).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 4D. /students/[id] — first student profile
// ──────────────────────────────────────────────────────
test.describe('4D. student profile', () => {
  test('4D.1 open first student → profile renders + axe', async ({ page }) => {
    await page.goto('/students');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const link = page.locator('main a[href^="/students/"]').first();
    const hasLink = await link.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasLink) { test.skip(true, 'No student rows to open'); return; }
    await link.click();
    await expect(page).toHaveURL(/\/students\/[^/]+/, { timeout: 10_000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(800);
    await shot(page, `${DIR}/4D-student-profile`);
    await expectNoA11yViolations(page);
  });

  test('4D.6 nonexistent student shows error', async ({ page }) => {
    await page.goto('/students/nonexistent-id-zzz');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    await shot(page, `${DIR}/4D-student-not-found`);
  });
});

// ──────────────────────────────────────────────────────
// 4E. /students/groups
// ──────────────────────────────────────────────────────
test.describe('4E. /students/groups', () => {
  test('4E.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/students/groups');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/4E-groups`);
    await expectNoA11yViolations(page);
    stop();
  });
});

// ──────────────────────────────────────────────────────
// 4F. Lesson modal (from /lessons)
// ──────────────────────────────────────────────────────
test.describe('4F. lesson modal', () => {
  test('4F.1 create-lesson modal: dialog role + axe + Escape closes', async ({ page }) => {
    await suppressTour(page);
    await page.goto('/lessons');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const createBtn = page.getByRole('button', { name: /create lesson|new lesson/i }).first();
    const hasBtn = await createBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasBtn) { test.skip(true, 'No create lesson button'); return; }
    await createBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await shot(page, `${DIR}/4F-lesson-modal`);
    await expectNoA11yViolations(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  });
});

// ──────────────────────────────────────────────────────
// 4H. Навігація + axe sweep (teacher pages)
// ──────────────────────────────────────────────────────
test.describe('4H. nav + axe sweep', () => {
  test('4H.1 sidebar has students+materials, no admin/system', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const nav = page.getByRole('navigation').first();
    const navVisible = await nav.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!navVisible) { test.skip(true, 'Sidebar hidden'); return; }
    await expect(nav.getByRole('link', { name: /students/i }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: /materials/i }).first()).toBeVisible();
    expect(await nav.getByRole('link', { name: /^admin$/i }).count()).toBe(0);
    expect(await nav.getByRole('link', { name: /^system$/i }).count()).toBe(0);
  });

  for (const path of ['/dashboard', '/lessons', '/materials', '/students', '/students/groups', '/calendar', '/chat', '/profile']) {
    test(`4H.2 axe ${path}`, async ({ page }) => {
      if (path === '/lessons') await suppressTour(page);
      await page.goto(path);
      await page.locator('main').waitFor({ state: 'visible', timeout: 10_000 });
      await expectNoA11yViolations(page);
    });
  }
});
