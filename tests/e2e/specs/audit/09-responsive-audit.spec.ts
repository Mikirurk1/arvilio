/**
 * АУДИТ Етап 9 — Адаптивність (mobile Pixel 7 / tablet 768×1024)
 * Запускати project=mobile-student (студентські сторінки).
 */
import { test, expect, type Page } from '@playwright/test';
import { shot } from '../../helpers/a11y';

const DIR = '09-responsive';
const PAGES = ['/dashboard', '/lessons', '/practice', '/vocabulary', '/calendar', '/chat', '/payment', '/profile'];

async function expectNoHScroll(page: Page, label: string) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `${label}: h-scroll (${scrollWidth} > ${clientWidth})`).toBeLessThanOrEqual(clientWidth + 1);
}

// ──────────────────────────────────────────────────────
// 9.2 mobile: без горизонтального скролу + скріни
// ──────────────────────────────────────────────────────
test.describe('9.2 mobile pages', () => {
  for (const path of PAGES) {
    test(`mobile ${path}: renders, no h-scroll`, async ({ page }) => {
      if (path === '/lessons') {
        await page.route('**/api/onboarding/tour**', (r) => {
          if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
          else void r.continue();
        });
      }
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(800);
      await shot(page, `${DIR}/mobile${path.replace(/\//g, '-')}`);
      await expectNoHScroll(page, `mobile ${path}`);
    });
  }
});

// ──────────────────────────────────────────────────────
// 9.1 mobile: сайдбар прихований / бургер
// ──────────────────────────────────────────────────────
test('9.1 mobile nav: sidebar hidden or burger present', async ({ page }) => {
  await page.route('**/api/onboarding/tour**', (r) => {
    if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
    else void r.continue();
  });
  await page.goto('/dashboard');
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
  const nav = page.getByRole('navigation', { name: /main/i }).first();
  const navVisible = await nav.isVisible({ timeout: 2_000 }).catch(() => false);
  if (navVisible) return; // сайдбар видно — теж валідно (широкий mobile landscape)
  const burger = page.getByRole('button', { name: /menu|navigation|open sidebar|toggle/i }).first();
  await expect(burger).toBeVisible({ timeout: 5_000 });
  await burger.click();
  await page.waitForTimeout(400);
  await shot(page, `${DIR}/mobile-nav-open`);
});

// ──────────────────────────────────────────────────────
// 9.7 tablet 768×1024: ключові екрани
// ──────────────────────────────────────────────────────
test.describe('9.7 tablet pages', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  for (const path of ['/dashboard', '/lessons', '/calendar']) {
    test(`tablet ${path}: renders, no h-scroll`, async ({ page }) => {
      if (path === '/lessons') {
        await page.route('**/api/onboarding/tour**', (r) => {
          if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
          else void r.continue();
        });
      }
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(800);
      await shot(page, `${DIR}/tablet${path.replace(/\//g, '-')}`);
      await expectNoHScroll(page, `tablet ${path}`);
    });
  }
});
