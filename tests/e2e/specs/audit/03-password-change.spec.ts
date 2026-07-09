/**
 * АУДИТ Етап 3 — 3L.2 зміна пароля (Account tab).
 * B2 мутаційний флоу з self-cleanup: міняємо пароль і одразу повертаємо назад,
 * тож сід лишається чистим. Використовуємо admin (student бере участь у tenant-
 * isolation реєстраціях; admin ізольованіший).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

const ORIG = 'TestPass123!';
const TEMP = 'TempSwap456!';

async function changePassword(page: import('@playwright/test').Page, from: string, to: string) {
  await page.goto('/profile');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('tab', { name: /account/i }).first().click();
  await page.getByRole('button', { name: /^change$/i }).click();
  const dialog = page.getByRole('dialog', { name: /change password/i });
  await expect(dialog).toBeVisible({ timeout: 6_000 });
  // Fill + blur each field so React state settles before submit (fill() can outrun
  // controlled onChange, leaving the submit handler with a stale value).
  const cur = dialog.locator('#current-password');
  const nw = dialog.locator('#new-password');
  const cf = dialog.locator('#confirm-password');
  await cur.click();
  await cur.pressSequentially(from, { delay: 15 });
  await nw.click();
  await nw.pressSequentially(to, { delay: 15 });
  await cf.click();
  await cf.pressSequentially(to, { delay: 15 });
  await expect(nw).toHaveValue(to);
  await dialog.getByRole('button', { name: /update password/i }).click();
  // success = the "Password updated" toast (role=status, auto-dismisses) AND the
  // modal closing. Assert the modal hides — the reliable, non-flaky success signal.
  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

test('3L.2 change password via UI → success, then revert (self-cleanup)', async ({ page }) => {
  // change ORIG → TEMP through the Account UI
  await changePassword(page, ORIG, TEMP);
  const withTemp = await page.request.post('/api/auth/login', {
    data: { email: 'jest-admin@soenglish.test', password: TEMP },
  });
  expect(withTemp.status(), 'new password works after UI change').toBe(201);

  // revert TEMP → ORIG via the UI too so the seeded credential keeps working
  await changePassword(page, TEMP, ORIG);
  const withOrig = await page.request.post('/api/auth/login', {
    data: { email: 'jest-admin@soenglish.test', password: ORIG },
  });
  expect(withOrig.status(), 'password reverted to seed value').toBe(201);
});

test('3L.2b wrong current password → error, no change', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('tab', { name: /account/i }).first().click();
  await page.getByRole('button', { name: /^change$/i }).click();
  const dialog = page.getByRole('dialog', { name: /change password/i });
  await expect(dialog).toBeVisible({ timeout: 6_000 });
  await dialog.locator('#current-password').fill('WrongCurrent999!');
  await dialog.locator('#new-password').fill('AnotherPass123!');
  await dialog.locator('#confirm-password').fill('AnotherPass123!');
  await dialog.getByRole('button', { name: /update password/i }).click();

  // error surfaced, modal stays open; original password remains valid
  await expect(dialog.getByText(/incorrect|wrong|invalid|does not match|current password/i).first()
    .or(dialog.getByRole('alert').filter({ hasText: /.+/ }).first()))
    .toBeVisible({ timeout: 8_000 });
  const res = await page.request.post('/api/auth/login', {
    data: { email: 'jest-admin@soenglish.test', password: ORIG },
  });
  expect(res.status()).toBe(201);
});
