import { STATE } from '../../fixtures/auth';
/**
 * Etap 3H — Vocabulary / Flashcards.
 */
import { test, expect } from '@playwright/test';

test.describe('Vocabulary — student', () => {
  test.use({ storageState: STATE.student });

  test('renders vocabulary page', async ({ page }) => {
    await page.goto('/vocabulary');
    await expect(page).toHaveURL(/\/vocabulary/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('shows word list or empty state', async ({ page }) => {
    await page.goto('/vocabulary');
    // Wait for loading spinner to disappear before checking content
    await page.getByText(/loading vocabulary|loading your word/i).waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    const hasWords = await page.getByTestId('vocab-word').first().isVisible().catch(() => false);
    // "0 words" text appears in the filter bar; or any count-based text
    const hasEmpty = await page
      .getByText(/no words|add your first|додайте перше|\d+ words|\b0\b/i)
      .first().isVisible().catch(() => false);
    expect(hasWords || hasEmpty).toBe(true);
  });

  test('add word button is visible', async ({ page }) => {
    await page.goto('/vocabulary');
    const btn = page
      .getByRole('button', { name: /add word|new word|додати/i })
      .or(page.getByTestId('add-word-btn'));
    await expect(btn).toBeVisible({ timeout: 8_000 });
  });

  test('practice / flashcard button is visible when words exist', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForLoadState('domcontentloaded');
    const hasWords = await page.getByTestId('vocab-word').first().isVisible().catch(() => false);
    if (!hasWords) return;
    const practiceBtn = page.getByRole('button', { name: /practice|flashcard|тренування/i });
    await expect(practiceBtn).toBeVisible();
  });
});

test.describe('Vocabulary — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher can open vocabulary', async ({ page }) => {
    await page.goto('/vocabulary');
    await expect(page).toHaveURL(/\/vocabulary/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});
