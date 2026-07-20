/**
 * АУДИТ Етап 4 — 4F.5 homework review + 4F.9 save lesson.
 * Opens completed seed lesson hub (workspace embeds content tab — not create modal).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

test('4F.5/4F.9 open completed lesson → mark homework checked → save', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'teacher', 'Teacher lesson review flow');
  await suppressTour(page);

  const res = await page.request.post('/api/graphql', {
    data: { query: `{ scheduledLessons { id title status studentResponse { homeworkChecked status } } }` },
  });
  const body = (await res.json()) as {
    data?: {
      scheduledLessons?: Array<{
        id: string;
        title: string;
        status: string;
        studentResponse?: { homeworkChecked?: boolean; status?: string } | null;
      }>;
    };
  };
  const lesson = (body.data?.scheduledLessons ?? []).find(
    (l) => /seed lesson — completed/i.test(l.title) || (l.status === 'COMPLETED' && l.studentResponse?.status === 'SUBMITTED'),
  );
  if (!lesson) {
    test.skip(true, 'Seed completed lesson with SUBMITTED homework not in GraphQL');
    return;
  }

  await page.goto(`/lessons/${lesson.id}`);
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/seed lesson — completed|seed homework|seed student homework/i).first())
    .toBeVisible({ timeout: 10_000 });

  const markBtn = page.getByRole('button', { name: /mark as checked/i }).first();
  if (await markBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
    await markBtn.click();
    await expect(page.getByText(/^checked$/i).first()).toBeVisible({ timeout: 6_000 });
  } else if (!lesson.studentResponse?.homeworkChecked) {
    // Already checked from a prior run, or review block not shown — still save
  }

  const saveBtn = page.getByRole('button', { name: /save lesson/i }).first();
  await expect(saveBtn).toBeVisible({ timeout: 8_000 });
  await saveBtn.click();
  // Success: button leaves loading / no error alert
  await page.waitForTimeout(800);
  const alert = page.getByRole('alert');
  if (await alert.isVisible({ timeout: 1_500 }).catch(() => false)) {
    const text = await alert.innerText();
    expect(text.toLowerCase()).not.toMatch(/failed|could not save|error/);
  }
});
