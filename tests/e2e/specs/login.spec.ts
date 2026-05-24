import { test, expect } from '@playwright/test';

/**
 * E2E login requires a provisioned user in the running API database.
 * Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD, or skip in CI until seed exists.
 */
const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('login', () => {
  test('redirects to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in|log in|увійти/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
