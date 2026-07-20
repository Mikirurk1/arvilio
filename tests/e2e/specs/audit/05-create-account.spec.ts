/**
 * АУДИТ Етап 5 — 5D.3 створення акаунта (B2 мутаційний флоу з cleanup).
 * Створюємо студента через /admin UI, перевіряємо появу в списку, прибираємо
 * через deleteAdminUser GraphQL у finally (сід лишається чистим).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

const DELETE = `mutation($id: ID!){ deleteAdminUser(id:$id){ ok } }`;
const LIST = `{ adminUsers { id email } }`;

test('5D.3 create student account → appears in list (self-cleanup)', async ({ page }) => {
  const email = `e2e-create-${Date.now()}@arvilio.test`;
  let createdId: string | null = null;

  try {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /account administration/i })).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/email/i).first().fill(email);
    await page.getByRole('button', { name: /create account/i }).click();

    // success: the new account surfaces (toast or the list row). Poll adminUsers.
    await expect
      .poll(async () => {
        const res = await page.request.post('/api/graphql', { data: { query: LIST } });
        const body = (await res.json()) as { data?: { adminUsers?: Array<{ id: string; email: string }> } };
        const row = (body.data?.adminUsers ?? []).find((u) => u.email === email);
        createdId = row?.id ?? null;
        return Boolean(row);
      }, { timeout: 12_000 })
      .toBe(true);

    expect(createdId, 'created account has an id').toBeTruthy();
  } finally {
    if (createdId) {
      await page.request.post('/api/graphql', { data: { query: DELETE, variables: { id: createdId } } });
    }
  }
});
