import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? 'jest-admin@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('System page', () => {
  test('admin can open system settings', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(adminEmail, password);
    await page.goto('/system');
    await expect(page).toHaveURL(/\/system/);
  });
});
