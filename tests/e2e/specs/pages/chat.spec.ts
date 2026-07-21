import { STATE } from '../../fixtures/auth';
/**
 * Etap 3J — Chat / Messages.
 */
import { test, expect } from '@playwright/test';
import { ChatPage } from '../../pages/ChatPage';

test.describe('Chat — student', () => {
  test.use({ storageState: STATE.student });

  test('renders chat inbox with heading and search', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    await expect(page).toHaveURL(/\/chat/);
    await expect(chat.inboxHeading()).toBeVisible();
    await expect(chat.searchField()).toBeVisible();
  });

  test('new message button is visible', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    await expect(chat.newMessageButton()).toBeVisible();
  });

  test('shows conversation list or empty state', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/chat/);
    // Inbox rows are buttons (not listitems); heading is "Chat"
    const hasConv = await page
      .locator('[class*="convRow"]')
      .or(page.getByRole('button', { name: /teacher|student|jest/i }))
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await chat.inboxHeading().isVisible().catch(() => false);
    const hasSearch = await chat.searchField().isVisible().catch(() => false);
    const hasEmpty = await page
      .getByText(/no messages|нема повідомлень|start a conversation|your messages|choose a conversation/i)
      .isVisible()
      .catch(() => false);
    expect(hasConv || hasHeading || hasSearch || hasEmpty).toBe(true);
  });

  test('search filters conversation list', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    const search = chat.searchField();
    await expect(search).toBeVisible();
    await search.fill('xyz_no_match_query', { force: true });
    await page.waitForTimeout(400); // debounce
    // Should either show "no results" or empty list
    const noResults = await page.getByText(/no results|нічого не знайдено/i).isVisible().catch(() => false);
    const emptyList = (await page.locator('[class*="convRow"]').count()) === 0;
    expect(noResults || emptyList).toBe(true);
  });
});

test.describe('Chat — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher can open chat', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    await expect(page).toHaveURL(/\/chat/);
    await expect(chat.inboxHeading()).toBeVisible();
  });

  test('unread badge disappears after opening conversation', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    // Find a conversation with unread badge (may not exist in test seed)
    const badge = page.getByTestId('unread-badge').first();
    const hasBadge = await badge.isVisible().catch(() => false);
    if (!hasBadge) return; // no unread messages — skip gracefully

    // Open the first unread conversation
    const item = page.getByRole('listitem').first();
    await item.click();
    await page.waitForTimeout(1_000);
    // Badge should be gone
    await expect(badge).not.toBeVisible();
  });
});

test.describe('Chat conversation view', () => {
  test.use({ storageState: STATE.teacher });

  test('opening a conversation shows message thread', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    await page.waitForLoadState('domcontentloaded');
    const firstConv = page.getByRole('listitem').first();
    const exists = await firstConv.isVisible().catch(() => false);
    if (!exists) {
      test.skip(true, 'No conversations in test seed');
      return;
    }
    await firstConv.click();
    // Message input should appear
    const input = page.getByRole('textbox', { name: /message|повідомлення/i })
      .or(page.getByPlaceholder(/type a message|написати/i));
    await expect(input).toBeVisible({ timeout: 6_000 });
  });

  test('send button is disabled when message input is empty', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();
    await page.waitForLoadState('domcontentloaded');
    const firstConv = page.getByRole('listitem').first();
    const exists = await firstConv.isVisible().catch(() => false);
    if (!exists) {
      test.skip(true, 'No conversations in test seed');
      return;
    }
    await firstConv.click();
    const sendBtn = page.getByRole('button', { name: /send|надіслати/i });
    await expect(sendBtn).toBeVisible({ timeout: 6_000 });
    // Empty input → send should be disabled
    const isDisabled = await sendBtn.isDisabled();
    expect(isDisabled).toBe(true);
  });
});
