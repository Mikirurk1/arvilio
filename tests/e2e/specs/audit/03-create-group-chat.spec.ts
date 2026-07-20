/**
 * АУДИТ Етап 3 — 3J.5 створення групового чату (B2 мутаційний флоу).
 * Відкриваємо /chat → натискаємо "Create group" → вводимо назву, вибираємо контакт,
 * сабмітимо → перевіряємо появу групи у списку чатів.
 * Cleanup: немає mutation deleteConversation — використовуємо унікальну назву.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

test('3J.5 create group chat (appears in inbox)', async ({ page }) => {
  const groupName = `E2E Chat ${Date.now()}`;

  await page.goto('/chat');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

  // Open "Create group" button (aria-label)
  const createGroupBtn = page.getByRole('button', { name: /create group/i });
  await createGroupBtn.waitFor({ state: 'visible', timeout: 8_000 });
  await createGroupBtn.click();

  // Dialog appears
  const dialog = page.getByRole('dialog', { name: /create group chat/i });
  await expect(dialog).toBeVisible({ timeout: 5_000 });

  // Fill group name
  await dialog.getByLabel(/group name/i).fill(groupName);

  // Contact list: buttons that are NOT the "Cancel" or "Create" action buttons
  const contactList = dialog.locator('[class*="contactList"] button, [class*="contact-list"] button').first();
  const hasContact = await contactList.isVisible({ timeout: 3_000 }).catch(() => false);
  if (!hasContact) {
    test.skip(true, 'No contacts available for group chat');
    return;
  }
  await contactList.click();

  // Submit
  await dialog.getByRole('button', { name: 'Create' }).click();

  // Dialog closes and group appears in inbox
  await expect(dialog).toBeHidden({ timeout: 8_000 });
  await expect(page.getByRole('button', { name: new RegExp(groupName) }).first()).toBeVisible({ timeout: 8_000 });
});
