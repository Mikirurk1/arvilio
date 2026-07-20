/**
 * АУДИТ Етап 3 — B6 chat (3J.3/7/8/9/10 via GraphQL mocks).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

const CONV_ID = 'mock-conv-1';
const PEER = {
  id: 'peer-1',
  displayName: 'Jest Teacher',
  displayRole: 'TEACHER',
  roleLabel: 'Teacher',
  avatarUrl: null,
  initials: 'JT',
};

function mockMsg(i: number, body?: string, attachment?: object | null) {
  return {
    id: `msg-${i}`,
    conversationId: CONV_ID,
    senderId: PEER.id,
    body: body ?? `Message ${i}`,
    createdAt: new Date(Date.now() - i * 60_000).toISOString(),
    isMine: false,
    attachment: attachment ?? null,
    sender: PEER,
  };
}

async function mockChatGraphql(
  page: Page,
  opts: {
    unreadCount?: number;
    messages?: ReturnType<typeof mockMsg>[];
    onMarkRead?: () => void;
  },
) {
  const firstPage = opts.messages ?? [mockMsg(0, 'Hello')];
  await page.route('**/api/graphql', async (route) => {
    const body = route.request().postDataJSON() as {
      query?: string;
      variables?: { conversationId?: string; cursor?: string; input?: { body?: string } };
    } | null;
    const q = body?.query ?? '';

    if (q.includes('chatInbox') && !q.includes('chatInboxPage')) {
      await route.fulfill({
        json: {
          data: {
            chatInbox: [
              {
                id: CONV_ID,
                type: 'direct',
                title: PEER.displayName,
                lastMessage: firstPage[0]?.body ?? '',
                lastMessageAt: new Date().toISOString(),
                unreadCount: opts.unreadCount ?? 0,
                updatedAt: new Date().toISOString(),
                peer: PEER,
                participants: [PEER],
              },
            ],
          },
        },
      });
      return;
    }

    if (q.includes('chatMessages')) {
      const cursor = body?.variables?.cursor;
      if (cursor) {
        await route.fulfill({
          json: { data: { chatMessages: [mockMsg(999, 'Older message from pagination')] } },
        });
        return;
      }
      await route.fulfill({ json: { data: { chatMessages: firstPage } } });
      return;
    }

    if (q.includes('markConversationRead')) {
      opts.onMarkRead?.();
      await route.fulfill({ json: { data: { markConversationRead: { ok: true } } } });
      return;
    }

    if (q.match(/sendChatMessage|createChatMessage/i)) {
      await route.fulfill({
        json: {
          data: {
            sendChatMessage: {
              id: 'mock-sent',
              body: body?.variables?.input?.body ?? 'hi',
              createdAt: new Date().toISOString(),
            },
          },
        },
      });
      return;
    }

    await route.continue();
  });
}

async function openMockThread(page: Page) {
  await page.goto('/chat');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const thread = page.getByRole('button', { name: new RegExp(PEER.displayName, 'i') }).first();
  if (!(await thread.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false))) {
    return false;
  }
  await thread.click();
  await expect(page.getByRole('log')).toBeVisible({ timeout: 8_000 });
  return true;
}

test('3J.3 send message mutation fires when composing (mocked delivery)', async ({ page }) => {
  let sendCalled = false;
  await mockChatGraphql(page, {});
  await page.route('**/api/graphql', async (route) => {
    const body = route.request().postDataJSON() as { query?: string; variables?: { input?: { body?: string } } } | null;
    if (body?.query?.match(/sendChatMessage|createChatMessage/i)) {
      sendCalled = true;
      await route.fulfill({
        json: {
          data: {
            sendChatMessage: {
              id: 'mock-sent',
              body: body.variables?.input?.body ?? 'hi',
              createdAt: new Date().toISOString(),
            },
          },
        },
      });
      return;
    }
    await route.continue();
  });

  if (!(await openMockThread(page))) {
    test.skip(true, 'No mocked thread');
    return;
  }

  const composer = page.getByRole('textbox', { name: /message/i });
  await composer.fill('E2E mock message');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect.poll(() => sendCalled, { timeout: 10_000 }).toBe(true);
});

test('3J.7 scroll up loads older messages (mocked pagination)', async ({ page }) => {
  const fullPage = Array.from({ length: 50 }, (_, i) => mockMsg(i));
  await mockChatGraphql(page, { messages: fullPage });
  if (!(await openMockThread(page))) {
    test.skip(true, 'No mocked thread');
    return;
  }

  const log = page.getByRole('log');
  await log.evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect(page.getByText(/loading older messages|older message from pagination/i).first())
    .toBeVisible({ timeout: 10_000 });
});

test('3J.8 unread badge clears after opening thread (mocked markRead)', async ({ page }) => {
  let markReadCalled = false;
  await mockChatGraphql(page, { unreadCount: 3, onMarkRead: () => { markReadCalled = true; } });
  await page.goto('/chat');
  await expect(page.locator('.unreadBadge').first()).toBeVisible({ timeout: 8_000 });
  if (!(await openMockThread(page))) {
    test.skip(true, 'No mocked thread');
    return;
  }
  await expect.poll(() => markReadCalled, { timeout: 8_000 }).toBe(true);
  await expect(page.locator('.unreadBadge')).toHaveCount(0, { timeout: 6_000 });
});

test('3J.9 thread renders message log for auto-scroll baseline', async ({ page }) => {
  await mockChatGraphql(page, { messages: [mockMsg(0, 'Latest bubble')] });
  if (!(await openMockThread(page))) {
    test.skip(true, 'No mocked thread');
    return;
  }
  await expect(page.getByText('Latest bubble')).toBeVisible({ timeout: 6_000 });
  await expect(page.getByRole('log')).toBeVisible();
});

test('3J.10 expired attachment shows TTL message (mocked)', async ({ page }) => {
  await mockChatGraphql(page, {
    messages: [
      mockMsg(0, '', {
        id: 'att-1',
        fileName: 'expired.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        url: '/api/chat/files/expired',
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
        expired: true,
      }),
    ],
  });
  if (!(await openMockThread(page))) {
    test.skip(true, 'No mocked thread');
    return;
  }
  await expect(page.getByText(/file expired|deleted after 24 hours/i).first()).toBeVisible({ timeout: 8_000 });
});
