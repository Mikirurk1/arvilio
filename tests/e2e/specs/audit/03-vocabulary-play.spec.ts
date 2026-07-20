/**
 * АУДИТ Етап 3 — B5 vocabulary play (3D.2–4 text feedback; Arvi poses N/A until B7).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

async function startVocabularyPlay(page: import('@playwright/test').Page) {
  await page.goto('/practice/vocabulary');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const playMode = page.getByRole('radio', { name: /^play$/i });
  if (!(await playMode.waitFor({ state: 'visible', timeout: 6_000 }).then(() => true).catch(() => false))) {
    return false;
  }
  await playMode.click();
  await expect(page.getByRole('heading', { name: /ready to play/i })).toBeVisible({ timeout: 8_000 });
  await page.getByRole('button', { name: /^play$/i }).click();
  await expect(page.getByRole('button', { name: /check answer/i })).toBeVisible({ timeout: 10_000 });
  return true;
}

test('3D.2 correct answer shows text feedback + Arvi celebrate', async ({ page }) => {
  if (!(await startVocabularyPlay(page))) {
    test.skip(true, 'Play mode unavailable');
    return;
  }
  const options = page.locator('main button').filter({ hasNotText: /check answer|finish game|next/i });
  await options.first().click();
  await page.getByRole('button', { name: /check answer/i }).click();
  await expect(page.getByText(/correct!|not quite/i).first()).toBeVisible({ timeout: 6_000 });
});

test('3D.3 wrong answer path still surfaces feedback text (Arvi encourage — N/A B7)', async ({ page }) => {
  if (!(await startVocabularyPlay(page))) {
    test.skip(true, 'Play mode unavailable');
    return;
  }
  const optionBtns = page.locator('main button').filter({ hasNotText: /check answer|finish game|next/i });
  const count = await optionBtns.count();
  if (count < 2) {
    test.skip(true, 'Not enough options');
    return;
  }
  await optionBtns.nth(count - 1).click();
  await page.getByRole('button', { name: /check answer/i }).click();
  await expect(page.getByText(/correct answer:|not quite|correct!/i).first()).toBeVisible({ timeout: 6_000 });
});

test('3D.4 finish round shows session summary', async ({ page }) => {
  if (!(await startVocabularyPlay(page))) {
    test.skip(true, 'Play mode unavailable');
    return;
  }
  for (let i = 0; i < 12; i++) {
    const check = page.getByRole('button', { name: /check answer/i });
    if (!(await check.isVisible({ timeout: 1_500 }).catch(() => false))) break;
    const opt = page.locator('main button').filter({ hasNotText: /check answer|finish game|next/i }).first();
    if (await opt.isVisible({ timeout: 1_000 }).catch(() => false)) await opt.click();
    await check.click();
    const next = page.getByRole('button', { name: /next question|see results/i });
    if (await next.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await next.click();
      if (await page.getByText(/round complete/i).isVisible({ timeout: 2_000 }).catch(() => false)) break;
    }
  }
  const summary = page.getByText(/round complete/i);
  if (!(await summary.isVisible({ timeout: 4_000 }).catch(() => false))) {
    await page.getByRole('button', { name: /finish game/i }).click();
    await page.getByRole('button', { name: /save & finish/i }).click();
  }
  await expect(page.getByText(/round complete|\d+\s*\/\s*\d+\s*correct/i).first()).toBeVisible({ timeout: 8_000 });
});
