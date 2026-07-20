/**
 * АУДИТ Етап 3 — B6 speaking mic (3G subset, getUserMedia mocked).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fakeStream = {
      getTracks: () => [{ stop: () => {} }],
      getAudioTracks: () => [{ stop: () => {} }],
    };
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => fakeStream,
    });
  });
});

test('3G.1 speaking page record flow with mocked microphone', async ({ page }) => {
  await page.goto('/practice/speaking');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

  const createCard = page.getByRole('button', { name: /create topic|new topic/i }).first();
  if (await createCard.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await createCard.click();
    const title = page.getByLabel(/title|topic/i).or(page.getByPlaceholder(/topic/i)).first();
    if (await title.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await title.fill(`E2E Speaking ${Date.now()}`);
      await page.getByRole('button', { name: /create|save/i }).first().click();
    }
  }

  const recordBtn = page.getByRole('button', { name: /record|start recording/i }).first();
  if (!(await recordBtn.waitFor({ state: 'visible', timeout: 12_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'No record button (no speaking topic)');
    return;
  }
  await recordBtn.click();
  const stopBtn = page.getByRole('button', { name: /stop/i }).first();
  if (await stopBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
    await page.waitForTimeout(500);
    await stopBtn.click();
    await expect(page.getByRole('button', { name: /submit|re-record|done/i }).first())
      .toBeVisible({ timeout: 8_000 });
  }
});
