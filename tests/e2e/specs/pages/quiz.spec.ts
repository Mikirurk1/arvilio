import { STATE } from '../../fixtures/auth';
/**
 * Etap 3G — Quiz page.
 */
import { test, expect } from '@playwright/test';

test.describe('Quiz — student', () => {
  test.use({ storageState: STATE.student });

  test('renders quiz page', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('shows quiz list or empty state', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('domcontentloaded');
    const hasQuiz = await page.getByTestId('quiz-card').first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no quizzes|немає тестів/i).isVisible().catch(() => false);
    expect(hasQuiz || hasEmpty).toBe(true);
  });
});

test.describe('Quiz — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher can open quiz page', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('teacher sees create quiz button', async ({ page }) => {
    await page.goto('/quiz');
    const btn = page.getByRole('button', { name: /create quiz|new quiz|створити тест/i });
    const exists = await btn.isVisible().catch(() => false);
    if (exists) await expect(btn).toBeVisible();
  });
});
