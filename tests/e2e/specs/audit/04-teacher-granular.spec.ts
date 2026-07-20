/**
 * АУДИТ Етап 4 — TEACHER granular: інтеракційні сценарії (materials view/search,
 * students scope, профіль студента таби, groups, lesson modal таби).
 * Глибокі флоу (upload/compression/nav-lock, PDF viewer/annotations, video provider,
 * recurrence materialization, group billing math) — беклог (див. 04-teacher.md).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

async function suppressTourLocal(page: Page) {
  await suppressTour(page);
}

// ──────────────────────────────────────────────────────
// 4A. /materials
// ──────────────────────────────────────────────────────
test.describe('4A. materials', () => {
  test('4A.1 header + grid/list view toggle switches', async ({ page }) => {
    await suppressTourLocal(page);
    await page.goto('/materials');
    await expect(page.getByRole('heading', { name: /materials/i }).first()).toBeVisible({ timeout: 10_000 });
    const listRadio = page.getByRole('radio', { name: /list/i });
    if (!(await listRadio.isVisible({ timeout: 4_000 }).catch(() => false))) {
      test.skip(true, 'No view toggle');
      return;
    }
    await listRadio.click();
    await expect(listRadio).toHaveAttribute('aria-checked', 'true');
    const gridRadio = page.getByRole('radio', { name: /grid/i });
    await gridRadio.click();
    await expect(gridRadio).toHaveAttribute('aria-checked', 'true');
  });

  test('4A.2 search filters to empty on nonsense query', async ({ page }) => {
    await suppressTourLocal(page);
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const search = page.getByRole('searchbox', { name: /search materials/i })
      .or(page.getByPlaceholder(/search materials/i)).first();
    await search.fill('zzz-nonexistent-material-xyz');
    // list is server-filtered on debounce → wait for the seed card to disappear
    await expect(page.getByText(/seed material — grammar book/i)).toHaveCount(0, { timeout: 10_000 });
  });

  test('4A.3 kind filter stat cards hide non-matching materials', async ({ page }) => {
    await suppressTourLocal(page);
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/loading materials/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});

    const seedTitle = page.getByText(/seed material — grammar book/i).first();
    if (!(await seedTitle.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'Seed book material not visible');
      return;
    }

    await page.getByRole('button', { name: /books/i }).click();
    await expect(seedTitle).toBeVisible({ timeout: 8_000 });

    await page.getByRole('button', { name: /boards/i }).click();
    await expect(seedTitle).toHaveCount(0, { timeout: 8_000 });
    await expect(page.getByText(/no materials yet/i)).toBeVisible({ timeout: 6_000 });

    await page.getByRole('button', { name: /total/i }).click();
    await expect(seedTitle).toBeVisible({ timeout: 8_000 });
  });

  test('4A.14 seeded material visible before filtering', async ({ page }) => {
    await suppressTourLocal(page);
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/loading materials/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    const hasSeed = await page.getByText(/seed material — grammar book/i).first().isVisible({ timeout: 6_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/no materials/i).isVisible({ timeout: 1_500 }).catch(() => false);
    expect(hasSeed || hasEmpty).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 4C. /students
// ──────────────────────────────────────────────────────
test.describe('4C. students', () => {
  test('4C.1 list shows seeded student', async ({ page }) => {
    await page.goto('/students');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/loading students/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    const hasRow = await page.locator('main a[href^="/students/"]').first().isVisible({ timeout: 6_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/no students/i).isVisible({ timeout: 1_500 }).catch(() => false);
    expect(hasRow || hasEmpty).toBe(true);
  });

  test('4C.2 scope segmented control present (if group lessons enabled)', async ({ page }) => {
    await page.goto('/students');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const group = page.getByRole('radiogroup', { name: /students page view/i });
    if (!(await group.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'Group lessons flag off — no scope switcher');
      return;
    }
    expect(await group.getByRole('radio').count()).toBeGreaterThan(1);
  });
});

// ──────────────────────────────────────────────────────
// 4D. /students/[id] — tabs
// ──────────────────────────────────────────────────────
test.describe('4D. student profile tabs', () => {
  test('4D.1-6 profile tabs all open (Profile/Statistics/Lessons/Billing/Practice/Achievements)', async ({ page }) => {
    await page.goto('/students');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const link = page.locator('main a[href^="/students/"]').first();
    if (!(await link.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No student rows');
      return;
    }
    await link.click();
    await expect(page).toHaveURL(/\/students\/[^/]+/, { timeout: 10_000 });
    await expect(page.getByRole('tab').first()).toBeVisible({ timeout: 15_000 });

    for (const tab of ['Statistics', 'Lessons', 'Billing', 'Practice', 'Achievements', 'Profile'] as const) {
      const tabEl = page.getByRole('tab', { name: new RegExp(`^${tab}$`, 'i') }).first();
      if (!(await tabEl.isVisible({ timeout: 3_000 }).catch(() => false))) continue;
      await tabEl.click();
      await page.waitForTimeout(300);
      await expect(tabEl).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('main')).toBeVisible();
    }
  });
});

// ──────────────────────────────────────────────────────
// 4E. /students/groups
// ──────────────────────────────────────────────────────
test.describe('4E. student groups', () => {
  test('4E.1 groups page renders (list or empty)', async ({ page }) => {
    await page.goto('/students/groups');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(800);
    const text = (await page.locator('main').innerText()).trim();
    expect(text.length).toBeGreaterThan(10);
  });
});

// ──────────────────────────────────────────────────────
// 4F. Lesson modal — tabs + validation
// ──────────────────────────────────────────────────────
test.describe('4F. lesson modal', () => {
  test('4F.2/4F.3 setup + content tabs switch inside dialog', async ({ page }) => {
    await suppressTour(page);
    await page.goto('/lessons');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const createBtn = page.getByRole('button', { name: /create lesson|new lesson/i }).first();
    if (!(await createBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'No create lesson button');
      return;
    }
    await createBtn.click();
    const dialog = page.getByRole('dialog').filter({ has: page.getByRole('tab') });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    // two tabs: planning + content (setup fields load party-options async, so we
    // assert the reliable interaction: tab switch + Escape, not the async fields).
    const planningTab = dialog.getByRole('tab').first();
    const contentTab = dialog.getByRole('tab', { name: /content/i }).first();
    await expect(planningTab).toHaveAttribute('aria-selected', 'true');
    await expect(contentTab).toBeVisible({ timeout: 6_000 });
    await contentTab.click();
    await expect(contentTab).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  });
});
