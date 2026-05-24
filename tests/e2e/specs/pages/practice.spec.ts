import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('Practice page', () => {
  test('student can open practice hub', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await page.goto('/practice');
    await expect(page).toHaveURL(/\/practice/);
  });
});
