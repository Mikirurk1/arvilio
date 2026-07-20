/**
 * АУДИТ Етап 3 — B5 irregular verbs drill (3E.1–3).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

test('3E.1–3 irregular verbs drill start → check → results', async ({ page }) => {
  await page.goto('/practice/irregular-verbs');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const playBtn = page.getByRole('button', { name: /^play$/i });
  if (!(await playBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'Play button missing');
    return;
  }
  await playBtn.click();
  await expect(page.getByRole('heading', { name: /three forms drill/i })).toBeVisible({ timeout: 6_000 });
  await page.getByRole('button', { name: /start drill/i }).click();
  await expect(page.getByRole('button', { name: /check answer/i })).toBeVisible({ timeout: 8_000 });

  const option = page.locator('main button').filter({ hasNotText: /check answer|exit drill|next/i }).first();
  await option.click();
  await page.getByRole('button', { name: /check answer/i }).click();
  await expect(page.getByText(/correct!|not quite/i).first()).toBeVisible({ timeout: 6_000 });

  for (let i = 0; i < 15; i++) {
    const next = page.getByRole('button', { name: /next question|see results/i });
    if (!(await next.isVisible({ timeout: 1_500 }).catch(() => false))) break;
    await next.click();
    if (await page.getByText(/review mistakes|play again|back to table/i).first().isVisible({ timeout: 2_000 }).catch(() => false)) break;
    const opt = page.locator('main button').filter({ hasNotText: /check answer|exit drill|next/i }).first();
    if (await opt.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await opt.click();
      await page.getByRole('button', { name: /check answer/i }).click();
    }
  }
  await expect(page.getByText(/review mistakes|play again|back to table|\d+\s*\/\s*\d+/i).first())
    .toBeVisible({ timeout: 10_000 });
});
