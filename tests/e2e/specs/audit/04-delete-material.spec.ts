/**
 * АУДИТ Етап 4 — 4A.15 видалення матеріалу (B2 мутаційний флоу з cleanup).
 * Стратегія: створюємо тимчасовий матеріал через GraphQL createLibraryMaterial,
 * потім знаходимо його у /materials через заголовок, видаляємо через UI (delete кнопка),
 * підтверджуємо зникнення. finally: cleanup через deleteLibraryMaterial якщо ще не видалено.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.teacher });

const CREATE = `
  mutation($input: CreateLibraryMaterialInput!) {
    createLibraryMaterial(input: $input) { id title }
  }
`;
const DELETE_GQL = `mutation($id: ID!) { deleteLibraryMaterial(id: $id) }`;

test('4A.15 delete material via UI (self-cleanup)', async ({ page }) => {
  const title = `E2E Delete ${Date.now()}`;
  let createdId: string | null = null;

  try {
    // Create material via GraphQL so we control the exact title
    const createRes = await page.request.post('/api/graphql', {
      data: { query: CREATE, variables: { input: { title, kind: 'BOOK', tags: [], level: 'A1' } } },
    });
    const createBody = (await createRes.json()) as { data?: { createLibraryMaterial?: { id: string } } };
    createdId = createBody.data?.createLibraryMaterial?.id ?? null;
    expect(createdId, 'material created').toBeTruthy();

    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

    // Find the material card/row by title
    const card = page.locator('text=' + title).first();
    await card.waitFor({ state: 'visible', timeout: 8_000 });

    // Open context menu or delete button — hover to reveal actions
    await card.hover();

    // Look for delete button (may be in a dropdown, kebab menu, or inline)
    const deleteBtn = page
      .getByRole('button', { name: /delete|remove/i })
      .or(page.locator('[aria-label*="delete" i], [aria-label*="remove" i]'))
      .first();
    await deleteBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await deleteBtn.click();

    // Confirm dialog if present
    const confirmBtn = page.getByRole('button', { name: /confirm|yes|delete/i }).last();
    const hasConfirm = await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false);
    if (hasConfirm) await confirmBtn.click();

    // Material should disappear
    await expect(page.locator('text=' + title)).toHaveCount(0, { timeout: 8_000 });
    createdId = null; // successfully deleted via UI
  } finally {
    if (createdId) {
      await page.request.post('/api/graphql', {
        data: { query: DELETE_GQL, variables: { id: createdId } },
      });
    }
  }
});
