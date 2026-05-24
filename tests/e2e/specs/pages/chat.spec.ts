import { test, expect } from '@playwright/test';
import { ChatPage } from '../../pages/ChatPage';
import { LoginPage } from '../../pages/LoginPage';

const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('Chat page', () => {
  test('student can open chat inbox', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await expect(page).toHaveURL(/\/dashboard/);

    const chat = new ChatPage(page);
    await chat.goto();
    await expect(page).toHaveURL(/\/chat/);
    await expect(chat.inboxHeading()).toBeVisible();
    await expect(chat.searchField()).toBeVisible();
    await expect(chat.newMessageButton()).toBeVisible();
  });
});
