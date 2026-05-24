import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * E2E login requires a provisioned user in the running API database.
 * Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD, or skip in CI until seed exists.
 */
const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('login', () => {
  test('redirects to dashboard after login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
