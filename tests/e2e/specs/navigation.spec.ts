import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SidebarNav } from '../pages/SidebarNav';

const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';
const teacherEmail = process.env.PLAYWRIGHT_TEACHER_EMAIL ?? 'jest-teacher@soenglish.test';
const teacherPassword = process.env.PLAYWRIGHT_TEACHER_PASSWORD ?? 'TestPass123!';

test.describe('role navigation', () => {
  test('student does not see admin link in sidebar', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await expect(page).toHaveURL(/\/dashboard/);
    const nav = new SidebarNav(page);
    await expect(nav.link(/admin/i)).toHaveCount(0);
  });

  test('teacher sees students link', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(teacherEmail, teacherPassword);
    await expect(page).toHaveURL(/\/dashboard/);
    const nav = new SidebarNav(page);
    await nav.expectVisible(/students/i);
  });
});
