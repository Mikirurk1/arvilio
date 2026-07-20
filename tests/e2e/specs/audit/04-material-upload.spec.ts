/**
 * АУДИТ Етап 4 — B4 material file upload (4A.7 subset: create + asset file).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { FIXTURE_FILES } from '../../fixtures/files';

test.use({ storageState: STATE.teacher });

const DELETE_GQL = `mutation($id: ID!) { deleteLibraryMaterial(id: $id) }`;

test('4A.7 create material with file attachment (mock upload API)', async ({ page }) => {
  const title = `E2E Upload ${Date.now()}`;
  let createdId: string | null = null;

  await page.route('**/api/materials/files/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, json: { ok: true, fileName: 'sample.pdf' } });
      return;
    }
    await route.continue();
  });

  try {
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /add material/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    await dialog.getByLabel(/^title$/i).fill(title);
    const fileInput = dialog.locator('input[type="file"]').first();
    await fileInput.setInputFiles(FIXTURE_FILES.pdf);

    await dialog.getByRole('button', { name: /create material/i }).click();
    await expect(page.locator('text=' + title).first()).toBeVisible({ timeout: 15_000 });

    const listRes = await page.request.post('/api/graphql', {
      data: {
        query: `{ libraryMaterials { id title } }`,
      },
    });
    const body = (await listRes.json()) as { data?: { libraryMaterials?: Array<{ id: string; title: string }> } };
    createdId = (body.data?.libraryMaterials ?? []).find((m) => m.title === title)?.id ?? null;
    expect(createdId).toBeTruthy();
  } finally {
    if (createdId) {
      await page.request.post('/api/graphql', { data: { query: DELETE_GQL, variables: { id: createdId } } });
    }
  }
});
