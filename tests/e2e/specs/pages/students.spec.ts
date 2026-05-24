import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const email = process.env.PLAYWRIGHT_TEACHER_EMAIL ?? 'jest-teacher@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('Students page', () => {
  test('teacher can open students list', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await page.goto('/students');
    await expect(page).toHaveURL(/\/students/);
  });
});
