/**
 * АУДИТ Етап 3 — B6 LiveKit inline JWT (3B.7 subset, mocked token + PreJoin).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.student });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fakeStream = {
      getTracks: () => [{ stop: () => {} }],
      getAudioTracks: () => [{ getSettings: () => ({ deviceId: 'mic-e2e' }), stop: () => {} }],
      getVideoTracks: () => [{ getSettings: () => ({ deviceId: 'cam-e2e' }), stop: () => {} }],
    };
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => fakeStream,
    });
  });
});

test('3B.7 LiveKit token fetch opens pre-join when lesson provider is livekit', async ({ page }) => {
  let tokenHit = false;

  await page.route('**/api/graphql', async (route) => {
    const body = route.request().postDataJSON() as { query?: string } | null;
    if (body?.query?.includes('scheduledLessons')) {
      const response = await route.fetch();
      const json = (await response.json()) as {
        data?: { scheduledLessons?: Array<Record<string, unknown>> };
      };
      if (json.data?.scheduledLessons) {
        json.data.scheduledLessons = json.data.scheduledLessons.map((lesson) =>
          typeof lesson.title === 'string' && /planned/i.test(lesson.title)
            ? { ...lesson, videoProvider: 'livekit' }
            : lesson,
        );
      }
      await route.fulfill({ response, json });
      return;
    }
    await route.continue();
  });

  await page.route('**/livekit-token**', async (route) => {
    tokenHit = true;
    await route.fulfill({
      json: {
        wsUrl: 'wss://mock-livekit.e2e.test',
        token: 'mock-livekit-jwt',
        roomName: 'e2e-lesson-room',
      },
    });
  });

  await suppressTour(page);
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

  const planned = page.getByRole('link', { name: /seed lesson — planned/i }).first();
  if (!(await planned.isVisible({ timeout: 10_000 }).catch(() => false))) {
    test.skip(true, 'No planned seed lesson');
    return;
  }
  await planned.click();
  await expect(page).toHaveURL(/\/lessons\//, { timeout: 10_000 });

  await expect.poll(() => tokenHit, { timeout: 12_000 }).toBe(true);
  await expect(page.getByRole('button', { name: /^join$/i })).toBeVisible({ timeout: 15_000 });
});
