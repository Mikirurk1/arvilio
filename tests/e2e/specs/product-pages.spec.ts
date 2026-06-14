import { test, expect } from '@playwright/test';

const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';
const teacherEmail = process.env.PLAYWRIGHT_TEACHER_EMAIL ?? 'jest-teacher@soenglish.test';
const teacherPassword = process.env.PLAYWRIGHT_TEACHER_PASSWORD ?? 'TestPass123!';

async function login(page: import('@playwright/test').Page, userEmail: string, userPassword: string) {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(userEmail);
  await page.getByLabel('Password', { exact: true }).fill(userPassword);
  await page.getByRole('button', { name: /sign in|log in|увійти/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('product pages smoke', () => {
  test('student opens vocabulary page', async ({ page }) => {
    await login(page, email, password);
    await page.goto('/vocabulary');
    await expect(page).toHaveURL(/\/vocabulary/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('student opens practice hub', async ({ page }) => {
    await login(page, email, password);
    await page.goto('/practice');
    await expect(page).toHaveURL(/\/practice/);
  });

  test('teacher opens calendar', async ({ page }) => {
    await login(page, teacherEmail, teacherPassword);
    await page.goto('/calendar');
    await expect(page).toHaveURL(/\/calendar/);
  });
});
