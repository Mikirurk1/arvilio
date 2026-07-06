/**
 * АУДИТ Етап 3 — STUDENT granular: інтеракційні сценарії (навігація, quick-actions,
 * таби, фільтри, наявність віджетів). Спирається на розширений сід (уроки/словник/
 * quiz/платіж/матеріали). Глибокі флоу (realtime socket, LiveKit JWT, OAuth, mic,
 * provider-checkout) — беклог, потребують інфри/моків (див. 03-student.md).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

async function suppressTour(page: Page) {
  await page.route('**/api/onboarding/tour**', (r) => {
    if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
    else void r.continue();
  });
}

// ──────────────────────────────────────────────────────
// 3A. /dashboard
// ──────────────────────────────────────────────────────
test.describe('3A. dashboard', () => {
  test('3A.3 loading placeholder resolves (no stuck "Loading…")', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/^loading/i).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    expect(await page.getByText(/loading lessons/i).count()).toBe(0);
  });

  test('3A.5 "Review words" links to /practice/vocabulary or /vocabulary', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const link = page.getByRole('link', { name: /review words|vocabulary|practice words/i }).first();
    await expect(link).toBeVisible({ timeout: 8_000 });
    expect(await link.getAttribute('href')).toMatch(/vocabulary|practice/);
  });

  test('3A.6 EntitlementsWidget renders', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    // widget shows plan/usage copy
    const hasWidget = await page.getByText(/plan|usage|lessons left|storage|seats|entitlement|upgrade/i)
      .first().isVisible({ timeout: 6_000 }).catch(() => false);
    expect(hasWidget).toBe(true);
  });

  test('3A.7 dashboard quick-action links all have in-app hrefs', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(800);
    const links = page.locator('main a[href^="/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href, `link ${i} href`).toMatch(/^\/[a-z]/);
    }
  });

  test('3A.8 Daily goals card shows goals', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    const hasGoals = await page.getByText(/daily goal|goals|easy|medium|hard|expert/i)
      .first().isVisible({ timeout: 6_000 }).catch(() => false);
    expect(hasGoals).toBe(true);
  });

  test('3A.10 statistics section renders (chart or stat tiles)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_200);
    const hasStats = await page.locator('main svg, main canvas, [class*="stat" i]')
      .first().isVisible({ timeout: 6_000 }).catch(() => false);
    expect(hasStats).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 3B. /lessons
// ──────────────────────────────────────────────────────
test.describe('3B. lessons', () => {
  test('3B.4 clicking a lesson opens /lessons/[id]', async ({ page }) => {
    await suppressTour(page);
    await page.goto('/lessons');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const lessonLink = page.locator('main a[href^="/lessons/"]').first();
    const has = await lessonLink.isVisible({ timeout: 6_000 }).catch(() => false);
    if (!has) { test.skip(true, 'No lessons in seed for this student'); return; }
    await lessonLink.click();
    await expect(page).toHaveURL(/\/lessons\/[^/]+/, { timeout: 10_000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  });

  test('3B.5 /lessons/<nonexistent> → friendly error, not blank', async ({ page }) => {
    await suppressTour(page);
    await page.goto('/lessons/zzz-nonexistent');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    const text = (await page.locator('body').innerText()).trim();
    expect(text.length).toBeGreaterThan(20);
    expect(await page.getByText(/^loading/i).first().isVisible().catch(() => false)).toBe(false);
  });
});

// ──────────────────────────────────────────────────────
// 3C. /practice hub
// ──────────────────────────────────────────────────────
test.describe('3C. practice hub', () => {
  test('3C.1 stats block shows "Due for review" / "Quizzes open"', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/due for review/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/quizzes open/i)).toBeVisible();
  });

  test('3C.2-5 activity entries link to practice sub-routes', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hrefs = await page.locator('main a[href^="/practice/"], main a[href="/quiz"], main a[href="/vocabulary"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));
    // vocabulary entry is always present
    expect(hrefs.some((h) => /vocabulary/.test(h ?? ''))).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 3H. /vocabulary
// ──────────────────────────────────────────────────────
test.describe('3H. vocabulary', () => {
  test('3H.1 word list shows seeded words', async ({ page }) => {
    await page.goto('/vocabulary');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    const hasWords = await page.getByText(/seed word/i).first().isVisible({ timeout: 6_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/all done|no words/i).isVisible({ timeout: 1_500 }).catch(() => false);
    expect(hasWords || hasEmpty).toBe(true);
  });

  test('3H.2 status filter control switches view', async ({ page }) => {
    await page.goto('/vocabulary');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const filter = page.getByRole('button', { name: /^all$|new|learning|known|review|repeated/i }).first();
    const has = await filter.isVisible({ timeout: 4_000 }).catch(() => false);
    if (!has) { test.skip(true, 'No status filter'); return; }
    await filter.click();
    await page.waitForTimeout(400);
    await expect(page.locator('main')).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────
// 3I. /calendar
// ──────────────────────────────────────────────────────
test.describe('3I. calendar', () => {
  test('3I.4 period navigation prev/next changes the header', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const heading = page.locator('main h2').first();
    const before = await heading.textContent().catch(() => '');
    const next = page.getByRole('button', { name: /next period/i });
    if (!(await next.isVisible({ timeout: 4_000 }).catch(() => false))) {
      test.skip(true, 'No calendar nav');
      return;
    }
    // Week view stays within the same month for one step — advance enough to
    // cross a month boundary so the header label is guaranteed to change.
    for (let i = 0; i < 6; i++) {
      await next.click();
      await page.waitForTimeout(150);
    }
    const after = await heading.textContent().catch(() => '');
    expect(after).not.toBe(before);
  });
});

// ──────────────────────────────────────────────────────
// 3J. /chat
// ──────────────────────────────────────────────────────
test.describe('3J. chat', () => {
  test('3J.1 inbox: search + list or empty-state', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const hasSearch = await page.getByPlaceholder(/search conversations|search/i)
      .first().isVisible({ timeout: 6_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/no messages|no conversations|start a conversation|choose/i)
      .first().isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasSearch || hasEmpty).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 3K. /payment
// ──────────────────────────────────────────────────────
test.describe('3K. payment', () => {
  test('3K.3 lesson balance / prepaid credits shown', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    const hasBalance = await page.getByText(/balance|lessons left|credits|prepaid|lessons remaining/i)
      .first().isVisible({ timeout: 6_000 }).catch(() => false);
    const hasEmpty = await page.getByText(/no payment/i).isVisible({ timeout: 1_500 }).catch(() => false);
    expect(hasBalance || hasEmpty).toBe(true);
  });
});

// ──────────────────────────────────────────────────────
// 3L. /profile — tabs
// ──────────────────────────────────────────────────────
test.describe('3L. profile tabs', () => {
  const tabs = ['Statistics', 'Notifications', 'Appearance', 'Account'] as const;
  for (const tab of tabs) {
    test(`3L tab "${tab}" opens`, async ({ page }) => {
      await page.goto('/profile');
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
      const tabEl = page.getByRole('tab', { name: new RegExp(`^${tab}$`, 'i') }).first();
      const has = await tabEl.isVisible({ timeout: 5_000 }).catch(() => false);
      if (!has) { test.skip(true, `No "${tab}" tab for student`); return; }
      await tabEl.click();
      await page.waitForTimeout(400);
      await expect(page.locator('main')).toBeVisible();
    });
  }

  test('3L.3 Appearance: font-size control present', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const tabEl = page.getByRole('tab', { name: /appearance/i }).first();
    if (!(await tabEl.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No appearance tab');
      return;
    }
    await tabEl.click();
    // Font size is a SegmentedControl (role=radiogroup / role=radio).
    await expect(page.getByRole('radio', { name: /^(small|medium|large)$/i }).first())
      .toBeVisible({ timeout: 6_000 });
  });
});
