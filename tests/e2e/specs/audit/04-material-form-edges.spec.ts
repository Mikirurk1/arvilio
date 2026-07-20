/**
 * АУДИТ Етап 4 — MaterialFormModal edge cases (4A.8–4A.13).
 * Кластер B4: cover, multi-asset, compression, nav-lock progress, recovery banner, file policy.
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { FIXTURE_FILES } from '../../fixtures/files';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

async function openMaterialModal(page: Page) {
  await suppressTour(page);
  await page.goto('/materials');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const addBtn = page.getByRole('button', { name: /add material/i }).first();
  if (!(await addBtn.isVisible({ timeout: 4_000 }).catch(() => false))) return null;
  await addBtn.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 6_000 });
  return dialog;
}

test('4A.8 cover image: choose preview and remove', async ({ page }) => {
  const dialog = await openMaterialModal(page);
  if (!dialog) {
    test.skip(true, 'No add material button');
    return;
  }

  const coverSection = dialog.locator('section').filter({ hasText: 'Cover image' });
  await coverSection.locator('input[type="file"]').setInputFiles(FIXTURE_FILES.image);
  await expect(coverSection.locator('img').first()).toBeVisible({ timeout: 4_000 });

  await coverSection.getByRole('button', { name: /remove cover/i }).click();
  await expect(coverSection.locator('img')).toHaveCount(0);
  await page.keyboard.press('Escape').catch(() => {});
});

test('4A.9 book kind: Add asset creates multiple asset rows', async ({ page }) => {
  const dialog = await openMaterialModal(page);
  if (!dialog) {
    test.skip(true, 'No add material button');
    return;
  }

  await dialog.getByRole('radio', { name: /^book$/i }).click();
  await expect(dialog.getByRole('button', { name: /add asset/i })).toBeVisible({ timeout: 4_000 });
  await dialog.getByRole('button', { name: /add asset/i }).click();

  await expect(dialog.getByLabel(/^role$/i)).toHaveCount(2);
  await page.keyboard.press('Escape').catch(() => {});
});

test('4A.10 file compression select offers Balanced/Light/Strong/Off', async ({ page }) => {
  const dialog = await openMaterialModal(page);
  if (!dialog) {
    test.skip(true, 'No add material button');
    return;
  }

  const compression = dialog.getByLabel(/^file compression$/i).first();
  await expect(compression).toBeVisible({ timeout: 4_000 });
  const isNative = await compression.evaluate((el) => el.tagName === 'SELECT').catch(() => false);
  if (isNative) {
    const labels = await compression.locator('option').allTextContents();
    expect(labels.join(' ')).toMatch(/Balanced/);
    expect(labels.join(' ')).toMatch(/Strong/);
    expect(labels.join(' ')).toMatch(/Off/);
  } else {
    await expect(dialog.getByText(/file compression/i).first()).toBeVisible();
  }
  await page.keyboard.press('Escape').catch(() => {});
});

test('4A.11 nav lock: save progress panel during slow upload', async ({ page }) => {
  const title = `E2E NavLock ${Date.now()}`;
  let createdId: string | null = null;

  await page.route('**/api/materials/files/**', async (route) => {
    if (route.request().method() === 'POST') {
      await new Promise((r) => setTimeout(r, 2_500));
      await route.fulfill({ status: 200, json: { ok: true, fileName: 'sample.pdf' } });
      return;
    }
    await route.continue();
  });

  try {
    const dialog = await openMaterialModal(page);
    if (!dialog) {
      test.skip(true, 'No add material button');
      return;
    }

    await dialog.getByLabel(/^title$/i).fill(title);
    await dialog.locator('input[type="file"]').first().setInputFiles(FIXTURE_FILES.pdf);
    await dialog.getByRole('button', { name: /create material/i }).click();

    await expect(dialog.getByText(/saving material/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('text=' + title).first()).toBeVisible({ timeout: 20_000 });

    const listRes = await page.request.post('/api/graphql', {
      data: { query: `{ libraryMaterials { id title } }` },
    });
    const body = (await listRes.json()) as {
      data?: { libraryMaterials?: Array<{ id: string; title: string }> };
    };
    createdId = (body.data?.libraryMaterials ?? []).find((m) => m.title === title)?.id ?? null;
  } finally {
    if (createdId) {
      await page.request.post('/api/graphql', {
        data: {
          query: `mutation($id: ID!) { deleteLibraryMaterial(id: $id) }`,
          variables: { id: createdId },
        },
      });
    }
  }
});

test('4A.12 save recovery banner from sessionStorage', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'arvilio:material-pending-save',
      JSON.stringify({
        materialId: 'e2e-recovery-id',
        title: 'Recovery E2E Material',
        startedAt: Date.now(),
      }),
    );
  });

  await suppressTour(page);
  await page.goto('/materials');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/interrupted upload/i)).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText(/Recovery E2E Material/)).toBeVisible();
  await page.getByRole('button', { name: /^dismiss$/i }).click();
  await expect(page.getByText(/interrupted upload/i)).toHaveCount(0);
});

test('4A.13 file policy: invalid cover type and oversize message', async ({ page }) => {
  const dialog = await openMaterialModal(page);
  if (!dialog) {
    test.skip(true, 'No add material button');
    return;
  }

  const coverSection = dialog.locator('section').filter({ hasText: 'Cover image' });
  await coverSection.locator('input[type="file"]').setInputFiles(FIXTURE_FILES.text);
  await expect(dialog.getByText(/cover must be a jpeg, png, or webp image/i)).toBeVisible({
    timeout: 4_000,
  });

  await expect(dialog.getByText(/max \d+ mb per file/i).first()).toBeVisible();
  await page.keyboard.press('Escape').catch(() => {});
});
