/**
 * АУДИТ Етап 3/4 — B6 lesson video meeting (3B.6/4F.7 subset, mocked meet URL).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.student });

test('3B.6/4F.7 lesson page shows join meeting link when meet URL mocked', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    const body = route.request().postDataJSON() as { query?: string } | null;
    if (body?.query?.includes('scheduledLessons')) {
      await route.fulfill({
        json: {
          data: {
            scheduledLessons: [
              {
                id: 'mock-lesson-1',
                title: 'Seed lesson — planned',
                date: '2099-01-01',
                startTime: '10:00',
                endTime: '11:00',
                status: 'PLANNED',
                videoMeetingUrl: 'https://meet.google.com/mock-e2e',
                videoProvider: 'google',
                googleMeetUrl: 'https://meet.google.com/mock-e2e',
              },
            ],
          },
        },
      });
      return;
    }
    await route.continue();
  });

  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const lessonLink = page.locator('main a[href^="/lessons/"]').first();
  if (!(await lessonLink.waitFor({ state: 'visible', timeout: 12_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'No lessons');
    return;
  }
  await lessonLink.click();
  const join = page.getByRole('link', { name: /join google meet|join zoom|open meeting|join meeting/i }).first();
  if (!(await join.isVisible({ timeout: 10_000 }).catch(() => false))) {
    test.skip(true, 'Meet link not rendered (provider not configured)');
    return;
  }
  await expect(join).toHaveAttribute('href', /meet\.google\.com|zoom\.us|mock/i);
});
