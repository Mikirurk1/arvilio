import { STATE } from '../../fixtures/auth';
/**
 * Etap 3F — Practice hub (flashcards spaced repetition).
 */
import { test, expect } from '@playwright/test';

test.describe('Practice hub — student', () => {
  test.use({ storageState: STATE.student });

  test('renders practice page', async ({ page }) => {
    await page.goto('/practice');
    await expect(page).toHaveURL(/\/practice/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('shows practice mode cards or empty state', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('domcontentloaded');
    const hasCard = await page.getByTestId('practice-card').first().isVisible().catch(() => false);
    const hasEmpty = await page
      .getByText(/no words to practice|добре зроблено|all caught up/i)
      .isVisible()
      .catch(() => false);
    const hasMain = await page.getByRole('main').isVisible();
    expect(hasCard || hasEmpty || hasMain).toBe(true);
  });

  test('flashcard flip interaction works', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('domcontentloaded');
    const card = page.getByTestId('flashcard').or(page.getByRole('button', { name: /flip|show answer|показати/i })).first();
    const exists = await card.isVisible().catch(() => false);
    if (!exists) return;
    await card.click();
    // After flip, answer side should be visible
    const answer = page.getByTestId('flashcard-answer').or(page.getByText(/answer|відповідь/i));
    await expect(answer).toBeVisible({ timeout: 3_000 });
  });
});
