import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await page.waitForURL(/\/dashboard/);
  });

  test('student sees dashboard content', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});
