import { test, expect } from '@playwright/test';
import { CalendarPage } from '../../pages/CalendarPage';
import { LoginPage } from '../../pages/LoginPage';

const email = process.env.PLAYWRIGHT_TEACHER_EMAIL ?? 'jest-teacher@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('Calendar page', () => {
  test('teacher can open calendar grid', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await expect(page).toHaveURL(/\/dashboard/);

    const calendar = new CalendarPage(page);
    await calendar.goto();
    await expect(page).toHaveURL(/\/calendar/);
    await expect(calendar.heading()).toBeVisible();
  });
});
