/**
 * АУДИТ Етап 3 — 3J.2 open seeded direct chat + message history.
 * Resolves conversation via GraphQL, then opens it in the UI.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.student });

test('3J.2 open seeded dialog and see message history', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'student' && testInfo.project.name !== 'mobile-student',
    'Student inbox fixture',
  );
  await suppressTour(page);

  const res = await page.request.post('/api/graphql', {
    data: {
      query: `{ chatInbox { id title lastMessage peer { displayName id } } }`,
    },
  });
  const body = (await res.json()) as {
    data?: {
      chatInbox?: Array<{
        id: string;
        title: string;
        lastMessage: string | null;
        peer?: { displayName: string; id: string } | null;
      }>;
    };
    errors?: unknown;
  };
  const conv = (body.data?.chatInbox ?? []).find(
    (c) =>
      /jest teacher/i.test(c.title) ||
      /seed chat/i.test(c.lastMessage ?? '') ||
      /jest teacher/i.test(c.peer?.displayName ?? ''),
  );
  if (!conv) {
    test.skip(true, 'Seeded direct chat missing from chatInbox — re-run seed:test-users');
    return;
  }

  // Deep-link via peer opens/selects the DIRECT thread
  if (conv.peer?.id) {
    await page.goto(`/chat?peer=${encodeURIComponent(conv.peer.id)}`);
  } else {
    await page.goto('/chat');
  }
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

  // If peer deep-link didn't select, click inbox row by title
  const history = page.getByText(/seed chat — hello from teacher/i);
  if (!(await history.isVisible({ timeout: 6_000 }).catch(() => false))) {
    const row = page.getByRole('button', { name: new RegExp(conv.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
    await row.click();
  }

  // Message body may also appear in inbox preview — assert first match in thread area
  await expect(page.getByText(/seed chat — hello from teacher/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/seed chat — reply from student/i).first()).toBeVisible({ timeout: 6_000 });
});
