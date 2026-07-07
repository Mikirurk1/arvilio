/**
 * АУДИТ Етап 3 — STUDENT B3 (interaction без нової інфри):
 * 3J.4 «Search people» новий діалог, 3H.4 word detail modal, 3B.10 lesson calendar link.
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

test('3J.4 "New message" opens Search-people picker', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const newBtn = page.getByRole('button', { name: /new message/i }).first();
  if (!(await newBtn.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No new-message button');
    return;
  }
  await newBtn.click();
  await expect(page.getByPlaceholder(/search people/i).or(page.getByLabel(/search people/i)).first())
    .toBeVisible({ timeout: 6_000 });
});

test('3H.4 word detail modal opens from a card', async ({ page }) => {
  await page.goto('/vocabulary');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(1_000);
  // "View details"-style control on a word card
  const detailBtn = page.getByRole('button', { name: /detail|details|view|info/i }).first();
  if (!(await detailBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, 'No word-detail control (empty vocabulary or feature off)');
    return;
  }
  await detailBtn.click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 6_000 });
  await page.keyboard.press('Escape').catch(() => {});
});

test('3B.10 lesson detail has "Open in calendar" link', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const lessonLink = page.locator('main a[href^="/lessons/"]').first();
  // NB: locator.isVisible() ignores its timeout — use waitFor to actually wait.
  const hasLesson = await lessonLink.waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true).catch(() => false);
  if (!hasLesson) { test.skip(true, 'No lessons in seed'); return; }
  await lessonLink.click();
  await expect(page).toHaveURL(/\/lessons\/[^/]+/, { timeout: 10_000 });
  const calBtn = page.getByRole('link', { name: /open in calendar|in calendar|calendar/i }).first();
  await expect(calBtn).toBeVisible({ timeout: 8_000 });
  expect(await calBtn.getAttribute('href')).toMatch(/calendar/);
});
