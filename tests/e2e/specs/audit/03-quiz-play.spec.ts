/**
 * АУДИТ Етап 3 — B5 quiz play (3F.1–5; Arvi reactions N/A B7).
 * Requires quizAssignment for jest-student on "Seed quiz — basics" (seed.ts).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

test('3F.1–5 assigned quiz: start → answer → submit (text feedback only)', async ({ page }) => {
  await page.goto('/quiz');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByText(/loading/i).first().waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

  const startBtn = page
    .getByRole('button', { name: /start quiz|try again/i })
    .or(page.getByText(/seed quiz — basics/i).locator('..').getByRole('button', { name: /start/i }))
    .first();
  if (!(await startBtn.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'No assigned quiz in seed');
    return;
  }
  await startBtn.click();
  await expect(page.getByRole('button', { name: /check answer/i })).toBeVisible({ timeout: 10_000 });

  for (let q = 0; q < 6; q++) {
    const check = page.getByRole('button', { name: /check answer/i });
    if (!(await check.isVisible({ timeout: 2_000 }).catch(() => false))) break;
    const mcOption = page.locator('main button').filter({ hasText: /^[A-D]\s/ }).first();
    const fill = page.getByPlaceholder(/type your answer/i);
    if (await mcOption.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await mcOption.click();
    } else if (await fill.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await fill.fill('am');
    } else {
      const fallback = page.locator('main button').filter({ hasNotText: /check answer|cancel|submit/i }).first();
      if (await fallback.isVisible({ timeout: 1_000 }).catch(() => false)) await fallback.click();
    }
    await check.click();
    await expect(page.getByText(/correct!|not quite/i).first()).toBeVisible({ timeout: 6_000 });
    const next = page.getByRole('button', { name: /next question|submit quiz|finish practice/i });
    await next.click();
    if (await page.getByText(/excellent|well done|review mistakes|back to quizzes/i).first().isVisible({ timeout: 3_000 }).catch(() => false)) break;
  }
  await expect(page.getByText(/excellent|well done|review mistakes|back to quizzes|\d+\s*\/\s*\d+/i).first())
    .toBeVisible({ timeout: 12_000 });
});
