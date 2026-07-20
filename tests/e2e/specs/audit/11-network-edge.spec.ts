/**
 * АУДИТ Етап 11 — slow network + chat resilience (11.10–11.11 subset).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.describe('11.10 slow network', () => {
  test.use({ storageState: STATE.teacher });

  test('materials list shows loading hint on delayed GraphQL', async ({ page }) => {
    let delayed = false;
    await page.route('**/api/graphql', async (route) => {
      const body = route.request().postDataJSON() as { query?: string } | null;
      if (body?.query?.includes('libraryMaterials')) {
        delayed = true;
        await new Promise((r) => setTimeout(r, 2_000));
      }
      await route.continue();
    });

    await suppressTour(page);
    await page.goto('/materials');
    await expect(page.getByText(/loading materials/i)).toBeVisible({ timeout: 6_000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
    expect(delayed).toBe(true);
  });
});

test.describe('11.11 chat without Socket.IO', () => {
  test.use({ storageState: STATE.student });

  test('inbox still loads when socket.io is blocked (GraphQL fallback)', async ({ page }) => {
    await page.route('**/socket.io/**', (route) => route.abort('failed'));

    await page.route('**/api/graphql', async (route) => {
      const body = route.request().postDataJSON() as { query?: string } | null;
      const q = body?.query ?? '';
      if (q.includes('chatInbox') && !q.includes('chatInboxPage')) {
        await route.fulfill({
          json: {
            data: {
              chatInbox: [
                {
                  id: 'offline-conv',
                  type: 'direct',
                  title: 'Offline Inbox Peer',
                  lastMessage: 'Hello offline',
                  lastMessageAt: new Date().toISOString(),
                  unreadCount: 0,
                  updatedAt: new Date().toISOString(),
                  peer: {
                    id: 'peer-offline',
                    displayName: 'Offline Inbox Peer',
                    displayRole: 'TEACHER',
                    roleLabel: 'Teacher',
                    avatarUrl: null,
                    initials: 'OP',
                  },
                  participants: [],
                },
              ],
            },
          },
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/chat');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /offline inbox peer/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
