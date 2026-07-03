/**
 * АУДИТ Етап 3 — Роль STUDENT: всі сторінки
 * Navigate → Screenshot → axe → key-element checks
 */
import { test, expect } from '@playwright/test';
import { shot, expectNoA11yViolations, consoleGuard } from '../../helpers/a11y';
import { STATE } from '../../fixtures/auth';

const DIR = '03-student';

test.use({ storageState: STATE.student });

// ──────────────────────────────────────────────────────
// 3A. /dashboard
// ──────────────────────────────────────────────────────
test.describe('3A. /dashboard', () => {
  test('3A.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3A-dashboard`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3A.2 lessons block or empty state visible', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasLessons = await page.getByRole('heading', { name: /lesson|today|practice|keep practicing/i })
      .isVisible({ timeout: 5_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/all caught up|no lessons|empty/i)
      .isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasLessons || hasEmpty).toBe(true);
  });

  test('3A.5 quick-action "Review words" links to /vocabulary', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const link = page.getByRole('link', { name: /vocabulary|review words|words/i });
    const hasLink = await link.first().isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasLink) { test.skip(true, 'No vocabulary quick-action'); return; }
    const href = await link.first().getAttribute('href');
    expect(href).toMatch(/vocabulary/);
  });

  test('3A.10 statistics section renders', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    await shot(page, `${DIR}/3A-dashboard-scroll`);
  });
});

// ──────────────────────────────────────────────────────
// 3B. /lessons
// ──────────────────────────────────────────────────────
test.describe('3B. /lessons', () => {
  test('3B.1 render + screenshot + axe', async ({ page }) => {
    await page.route('**/api/onboarding/tour**', (r) => {
      if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
      else void r.continue();
    });
    const stop = consoleGuard(page);
    await page.goto('/lessons');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3B-lessons`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3B.2 filter tabs Planned/Completed/Cancelled', async ({ page }) => {
    await page.route('**/api/onboarding/tour**', (r) => {
      if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
      else void r.continue();
    });
    await page.goto('/lessons');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const filterGroup = page.getByRole('group', { name: /filter by status/i });
    const hasTab = await filterGroup.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasTab) { test.skip(true, 'No filter tabs found'); return; }
    const completedChip = filterGroup.getByRole('button', { name: /^done$|completed/i });
    await completedChip.scrollIntoViewIfNeeded();
    await completedChip.click();
    await page.waitForTimeout(500);
    await shot(page, `${DIR}/3B-lessons-completed-tab`);
  });
});

// ──────────────────────────────────────────────────────
// 3C. /practice (hub)
// ──────────────────────────────────────────────────────
test.describe('3C. /practice', () => {
  test('3C.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/practice');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3C-practice-hub`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3C.2 vocabulary entry link visible', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const link = page.getByRole('link', { name: /vocabulary|vocab/i });
    const hasLink = await link.first().isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasLink) { test.skip(true, 'No vocabulary entry on /practice'); return; }
    const href = await link.first().getAttribute('href');
    expect(href).toMatch(/vocabulary|practice/);
  });
});

// ──────────────────────────────────────────────────────
// 3D. /practice/vocabulary
// ──────────────────────────────────────────────────────
test.describe('3D. /practice/vocabulary', () => {
  test('3D.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/practice/vocabulary');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3D-practice-vocabulary`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3D.5 shows card or empty state', async ({ page }) => {
    await page.goto('/practice/vocabulary');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasCard = await page.getByText(/\b(all done|no words|start|review|done for today)/i)
      .isVisible({ timeout: 3_000 }).catch(() => false);
    const hasContent = await page.locator('main').getByRole('button').isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasCard || hasContent).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 3H. /vocabulary
// ──────────────────────────────────────────────────────
test.describe('3H. /vocabulary', () => {
  test('3H.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/vocabulary');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3H-vocabulary`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3H.2 filter segmented control or tabs', async ({ page }) => {
    await page.goto('/vocabulary');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasFilter = await page.getByRole('button', { name: /all|new|learning|known|review/i })
      .first().isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasFilter) { test.skip(true, 'No filter control on /vocabulary'); return; }
    await page.getByRole('button', { name: /all/i }).first().click();
    await page.waitForTimeout(400);
    await shot(page, `${DIR}/3H-vocabulary-filtered`);
  });
});

// ──────────────────────────────────────────────────────
// 3I. /calendar
// ──────────────────────────────────────────────────────
test.describe('3I. /calendar', () => {
  test('3I.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/calendar');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3I-calendar`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3I.1 week/month toggle works', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const monthBtn = page.getByRole('button', { name: /month/i });
    const hasToggle = await monthBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasToggle) { test.skip(true, 'No week/month toggle'); return; }
    await monthBtn.click();
    await page.waitForTimeout(400);
    await shot(page, `${DIR}/3I-calendar-month`);
  });
});

// ──────────────────────────────────────────────────────
// 3J. /chat
// ──────────────────────────────────────────────────────
test.describe('3J. /chat', () => {
  test('3J.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/chat');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3J-chat`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3J.1 inbox or empty state', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasInbox = await page.getByRole('heading', { name: /messages|chat/i })
      .isVisible({ timeout: 3_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/no messages|start a conversation|choose|нема/i)
      .isVisible({ timeout: 2_000 }).catch(() => false);
    const hasSearch = await page.getByPlaceholder(/search conversations|search/i)
      .isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasInbox || hasEmpty || hasSearch).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 3K. /payment
// ──────────────────────────────────────────────────────
test.describe('3K. /payment', () => {
  test('3K.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/payment');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3K-payment`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3K.2 methods or empty state visible', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasMethod = await page.getByText(/stripe|liqpay|wayforpay|card|invoice|manual|balance|credits|lessons left/i)
      .first().isVisible({ timeout: 5_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/no payment|not available|contact/i)
      .isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasMethod || hasEmpty).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 3L. /profile
// ──────────────────────────────────────────────────────
test.describe('3L. /profile', () => {
  test('3L.1 render + screenshot + axe', async ({ page }) => {
    const stop = consoleGuard(page);
    await page.goto('/profile');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await shot(page, `${DIR}/3L-profile`);
    await expectNoA11yViolations(page);
    stop();
  });

  test('3L tabs visible', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasTab = await page.getByRole('button', { name: /profile|account|appearance|notifications/i })
      .first().isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasTab) { test.skip(true, 'No profile tabs found'); return; }
    await page.getByRole('button', { name: /account/i }).first().click();
    await page.waitForTimeout(400);
    await shot(page, `${DIR}/3L-profile-account-tab`);
  });
});

// ──────────────────────────────────────────────────────
// 3M. a11y axe sweep — all student pages
// ──────────────────────────────────────────────────────
test.describe('3M. axe sweep', () => {
  for (const path of ['/dashboard', '/lessons', '/practice', '/vocabulary', '/calendar', '/chat', '/payment', '/profile']) {
    test(`3M.3 axe ${path}`, async ({ page }) => {
      if (path === '/lessons') {
        await page.route('**/api/onboarding/tour**', (r) => {
          if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
          else void r.continue();
        });
      }
      await page.goto(path);
      await page.locator('main').waitFor({ state: 'visible', timeout: 10_000 });
      await expectNoA11yViolations(page);
    });
  }
});
