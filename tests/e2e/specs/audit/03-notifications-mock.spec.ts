/**
 * АУДИТ Етап 3 — 3L.10 notification prefs (auto-save GraphQL mock).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

test('3L.10 Notifications toggle → updateMyProfile mock → Preferences saved', async ({
  page,
}) => {
  let saved = false;
  await page.route('**/api/graphql', async (route) => {
    const post = route.request().postData() ?? '';
    if (post.includes('updateMyProfile')) {
      saved = true;
      await route.fulfill({
        json: {
          data: {
            updateMyProfile: {
              id: 'u1',
              notificationPrefs: {
                lessonReminder: false,
                streakAlert: true,
                weeklyReport: true,
                newVocab: true,
                teacherMessages: true,
              },
            },
          },
        },
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/profile');
  await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });
  await page.getByRole('tab', { name: /notifications/i }).click();
  await expect(page.getByText(/lesson reminders/i)).toBeVisible({ timeout: 10_000 });

  const toggle = page.getByRole('button', { name: /lesson reminders/i });
  await expect(toggle).toBeVisible({ timeout: 8_000 });
  await toggle.click();

  await expect.poll(() => saved, { timeout: 8_000 }).toBe(true);
  await expect(page.getByText(/preferences saved/i).first()).toBeVisible({ timeout: 8_000 });
});
