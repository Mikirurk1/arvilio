/**
 * АУДИТ Етап 5 — 5A.7 Record staff payout (GraphQL mock).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.admin });

const STAFF_ROW = {
  userId: 'teacher-e2e-1',
  displayName: 'Jest Teacher',
  role: 'teacher',
  mode: 'per_lesson',
  completedLessons: 4,
  accruedMinor: 40000,
  paidMinor: 10000,
  outstandingMinor: 30000,
  currency: 'UAH',
  nextPayDate: new Date().toISOString(),
  payoutStatus: 'due',
};

function financeOverview() {
  return {
    range: 'month',
    rangeLabel: 'This month',
    rangeFrom: '2026-07-01',
    rangeTo: '2026-07-31',
    currency: 'UAH',
    totalAccruedMinor: 40000,
    totalPaidMinor: 10000,
    totalOutstandingMinor: 30000,
    staff: [STAFF_ROW],
    trend: [],
    recentPayouts: [],
  };
}

async function mockFinanceGraphql(page: Page, opts?: { onRecord?: () => void }) {
  await page.route('**/api/graphql', async (route) => {
    const body = route.request().postDataJSON() as { query?: string; variables?: Record<string, unknown> } | null;
    const q = body?.query ?? '';

    if (q.includes('staffFinanceOverview') || q.includes('StaffFinanceOverview')) {
      await route.fulfill({
        json: { data: { staffFinanceOverview: financeOverview() } },
      });
      return;
    }
    if (q.includes('recordStaffPayout') || q.includes('RecordStaffPayout')) {
      opts?.onRecord?.();
      await route.fulfill({
        json: {
          data: {
            recordStaffPayout: {
              id: 'payout-1',
              userId: STAFF_ROW.userId,
              userDisplayName: STAFF_ROW.displayName,
              amountMinor: 15000,
              currency: 'UAH',
              paidAt: new Date().toISOString(),
              note: 'E2E payout',
              createdByDisplayName: 'Jest Admin',
            },
          },
        },
      });
      return;
    }
    if (q.includes('staffPayoutHistory')) {
      await route.fulfill({
        json: {
          data: {
            staffPayoutHistoryPage: {
              items: [
                {
                  id: 'payout-1',
                  userId: STAFF_ROW.userId,
                  userDisplayName: STAFF_ROW.displayName,
                  amountMinor: 15000,
                  currency: 'UAH',
                  paidAt: new Date().toISOString(),
                  note: 'E2E payout',
                  createdByDisplayName: 'Jest Admin',
                },
              ],
              hasMore: false,
              nextCursor: null,
            },
            staffPayoutHistory: [],
          },
        },
      });
      return;
    }
    await route.continue();
  });
}

test('5A.7 Record staff payout modal → success', async ({ page }) => {
  await suppressTour(page);
  let recorded = false;
  await mockFinanceGraphql(page, { onRecord: () => { recorded = true; } });

  await page.goto('/finance');
  await expect(page.getByRole('heading', { name: /finance/i })).toBeVisible({ timeout: 12_000 });
  await expect(page.getByText(/Jest Teacher/i).first()).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: /record payout/i }).first().click();
  await expect(page.getByRole('heading', { name: /record payout/i })).toBeVisible({ timeout: 8_000 });

  await page.locator('#payout-amount').fill('150');
  await page.locator('#payout-note').fill('E2E payout');
  await page.getByRole('button', { name: /save payout/i }).click();

  await expect.poll(() => recorded, { timeout: 10_000 }).toBe(true);
  await expect(page.getByRole('heading', { name: /record payout/i })).toHaveCount(0, {
    timeout: 10_000,
  });
});
