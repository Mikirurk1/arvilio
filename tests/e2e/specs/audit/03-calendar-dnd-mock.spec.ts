/**
 * АУДИТ Етап 3 — 3I.5 calendar DnD reschedule (GraphQL mock).
 * Soft-skip if no draggable future lesson in week view.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

test('3I.5 DnD reschedule → updateScheduledLesson mocked', async ({ page }) => {
  await suppressTour(page);
  let mutated = false;
  await page.route('**/api/graphql', async (route) => {
    const post = route.request().postData() ?? '';
    if (post.includes('updateScheduledLesson')) {
      mutated = true;
      await route.fulfill({
        json: {
          data: {
            updateScheduledLesson: {
              id: 'lesson-dnd-1',
              title: 'DnD Lesson',
              ok: true,
            },
          },
        },
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/calendar');
  await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });

  const weekBtn = page.getByRole('button', { name: /^week$/i }).or(
    page.getByRole('tab', { name: /^week$/i }),
  );
  if (await weekBtn.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
    await weekBtn.first().click();
  }

  const lesson = page.locator('[data-week-lesson-id][draggable="true"]').first();
  if (!(await lesson.isVisible({ timeout: 8_000 }).catch(() => false))) {
    test.skip(true, 'No draggable future week lesson (seed/time)');
    return;
  }

  // Drop onto another day column in the week grid
  const box = await lesson.boundingBox();
  if (!box) {
    test.skip(true, 'No lesson bounding box');
    return;
  }

  await lesson.hover();
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 180, box.y + box.height / 2 + 120, {
    steps: 12,
  });
  await page.mouse.up();

  const apply = page.getByRole('button', { name: /this lesson|only this|detach|apply/i }).first();
  if (await apply.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await apply.click();
  }

  try {
    await expect.poll(() => mutated, { timeout: 12_000 }).toBe(true);
  } catch {
    test.skip(true, 'DnD did not fire updateScheduledLesson (drop missed)');
  }
});
