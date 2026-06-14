import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

// /system is super_admin only — admin role is redirected to dashboard
const adminEmail = process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL ?? 'jest-super-admin@soenglish.test';
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
