/**
 * АУДИТ Етап 5 — 5A.5 Back to staff, 5A.6 non-staff user, 5B.2–4 finance charts.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.admin });

test('5A.5 Back to staff from staff profile', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/staff');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.getByText(/loading staff/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});

  // Roster hides the current admin — open teacher card (Jest Teacher)
  let link = page.locator('main a[href^="/staff/"]').first();
  if (!(await link.isVisible({ timeout: 6_000 }).catch(() => false))) {
    const teacherCard = page.getByText(/jest teacher/i).first();
    if (await teacherCard.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await teacherCard.click();
    } else {
      // Resolve teacher id via GraphQL and navigate directly
      const res = await page.request.post('/api/graphql', {
        data: { query: `query { adminUsers { id email role } }` },
      });
      const body = (await res.json()) as {
        data?: { adminUsers?: Array<{ id: string; email: string }> };
      };
      const teacher = body.data?.adminUsers?.find((u) => u.email === 'jest-teacher@arvilio.test');
      if (!teacher) {
        test.skip(true, 'No staff rows / teacher id');
        return;
      }
      await page.goto(`/staff/${teacher.id}`);
    }
  } else {
    await link.click();
  }

  await expect(page).toHaveURL(/\/staff\/[^/]+/, { timeout: 10_000 });
  await page.getByRole('link', { name: /back to staff/i }).click();
  await expect(page).toHaveURL(/\/staff\/?$/, { timeout: 10_000 });
});

test('5A.6 student id on /staff/[id] → Not a staff member', async ({ page }) => {
  await suppressTour(page);
  const res = await page.request.post('/api/graphql', {
    data: { query: `query { adminUsers { id email role } }` },
  });
  const body = (await res.json()) as {
    data?: { adminUsers?: Array<{ id: string; email: string; role: string }> };
  };
  const student = body.data?.adminUsers?.find(
    (u) =>
      u.email === 'jest-student@arvilio.test' ||
      String(u.role).toLowerCase() === 'student',
  );
  if (!student) {
    await page.goto('/students');
    const studentLink = page.locator('main a[href^="/students/"]').first();
    if (!(await studentLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Could not resolve student id');
      return;
    }
    const href = await studentLink.getAttribute('href');
    const id = href?.split('/').pop();
    if (!id) {
      test.skip(true, 'No student id in href');
      return;
    }
    await page.goto(`/staff/${id}`);
  } else {
    await page.goto(`/staff/${student.id}`);
  }
  await expect(page.getByText(/not a staff member/i)).toBeVisible({ timeout: 10_000 });
});

test('5B.2–4 finance charts / breakdown / empty hints', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/finance');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/accrued vs paid trend/i)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/staff breakdown/i)).toBeVisible({ timeout: 6_000 });
  const hasChart = await page.locator('.recharts-responsive-container, svg.recharts-surface').first()
    .isVisible({ timeout: 6_000 }).catch(() => false);
  const hasEmptyHint = await page.getByText(/no trend data|no staff rows/i).first()
    .isVisible({ timeout: 2_000 }).catch(() => false);
  expect(hasChart || hasEmptyHint).toBe(true);
});
