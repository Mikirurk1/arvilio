/**
 * АУДИТ Етап 4 — 4B material viewer router smoke (mocked meta/annotations/file).
 * Full pdf.js render + Konva annotations — беклог; тут лише гілки роутера + book shell.
 */
import fs from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { FIXTURE_FILES } from '../../fixtures/files';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.teacher });

const ATTACH_ID = 'e2e-viewer-attach';
const PDF_BYTES = fs.readFileSync(FIXTURE_FILES.pdf);

const ANNOTATION_PAYLOAD = {
  document: { version: 1, pages: {} },
  overlayDocument: { version: 1, pages: {} },
  updatedAt: null,
  overlayUpdatedAt: null,
  readOnly: false,
  canEditOverlay: false,
  canClearOverlay: false,
  fileRevision: 'rev-e2e',
  fileName: 'E2E Seed Book.pdf',
  materialId: 'mat-e2e',
  subjectUserId: 'user-e2e',
  subjectDisplayName: null,
};

function metaResponse(mediaKind: 'pdf' | 'audio' | 'video' | 'other') {
  return {
    fileAttachmentId: ATTACH_ID,
    fileName: 'E2E Seed Book.pdf',
    mimeType: mediaKind === 'pdf' ? 'application/pdf' : 'audio/mpeg',
    mediaKind,
    assetRole: 'student_book',
  };
}

async function routeMaterialViewerApis(
  page: Page,
  opts: {
    meta?: ReturnType<typeof metaResponse> | 'error';
    includePdf?: boolean;
    includeAudio?: boolean;
    onAnnotationSave?: () => void;
    trackRange?: (range: string | undefined) => void;
  },
) {
  await page.route('**/api/materials/files/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/meta')) {
      if (opts.meta === 'error') {
        await route.fulfill({ status: 404, json: { message: 'Attachment not found' } });
        return;
      }
      await route.fulfill({ json: opts.meta ?? metaResponse('pdf') });
      return;
    }
    if (route.request().method() === 'GET') {
      const range = route.request().headers()['range'];
      opts.trackRange?.(range);
      if (opts.includePdf && !url.includes('/meta')) {
        const headers: Record<string, string> = {
          'content-type': 'application/pdf',
          'accept-ranges': 'bytes',
        };
        if (range) {
          const match = /bytes=(\d+)-(\d*)/.exec(range);
          const start = match ? Number.parseInt(match[1]!, 10) : 0;
          const end = match?.[2] ? Number.parseInt(match[2], 10) : Math.min(start + 1023, PDF_BYTES.length - 1);
          const slice = PDF_BYTES.subarray(start, end + 1);
          await route.fulfill({
            status: 206,
            headers: { ...headers, 'content-range': `bytes ${start}-${end}/${PDF_BYTES.length}` },
            body: slice,
          });
          return;
        }
        await route.fulfill({ status: 200, headers, body: PDF_BYTES });
        return;
      }
      if (opts.includeAudio) {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'audio/mpeg', 'accept-ranges': 'bytes' },
          body: Buffer.from([0xff, 0xfb, 0x90, 0x00]),
        });
        return;
      }
    }
    await route.continue();
  });

  await page.route('**/api/materials/annotations/**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: ANNOTATION_PAYLOAD });
      return;
    }
    if (route.request().method() === 'PUT') {
      opts.onAnnotationSave?.();
      const body = route.request().postDataJSON() as { document?: typeof ANNOTATION_PAYLOAD.document };
      await route.fulfill({
        json: {
          ...ANNOTATION_PAYLOAD,
          document: body.document ?? ANNOTATION_PAYLOAD.document,
          updatedAt: new Date().toISOString(),
        },
      });
      return;
    }
    await route.continue();
  });
}

test('4B.router shows error when attachment meta is missing', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, { meta: 'error' });
  await page.goto(`/materials/view/${ATTACH_ID}`);
  await expect(page.getByText(/attachment not found/i)).toBeVisible({ timeout: 10_000 });
});

test('4B.router unsupported file type message', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, { meta: metaResponse('other') });
  await page.goto(`/materials/view/${ATTACH_ID}`);
  await expect(page.getByText(/cannot be opened in the viewer/i)).toBeVisible({ timeout: 10_000 });
});

test('4B.router audio deep link opens player then returns to library', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, { meta: metaResponse('audio') });
  await page.goto(`/materials/view/${ATTACH_ID}`);
  await expect(page.getByText(/opening player/i)).toBeVisible({ timeout: 8_000 });
  await expect(page).toHaveURL(/\/materials/, { timeout: 10_000 });
});

test('4B.1 book viewer shell loads with toolbar (mocked PDF + annotations)', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, { meta: metaResponse('pdf'), includePdf: true });
  await page.goto(`/materials/view/${ATTACH_ID}`);
  await expect(page.getByRole('link', { name: /back/i })).toBeVisible({ timeout: 12_000 });
  await expect(page.getByRole('heading', { name: /E2E Seed Book\.pdf/i })).toBeVisible({ timeout: 12_000 });
  await expect(page.getByRole('button', { name: /zoom in/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('toolbar', { name: /drawing tools/i })).toBeVisible({ timeout: 15_000 });
});

test('4B.2–4B.4 page controls, zoom, and pen tool after PDF load', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, { meta: metaResponse('pdf'), includePdf: true });
  await page.goto(`/materials/view/${ATTACH_ID}`);

  await expect(page.getByRole('button', { name: /next page/i })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: /zoom in/i }).click();
  await page.getByRole('button', { name: /^select$/i }).click();
  await page.getByRole('button', { name: /^pen$/i }).click();
  await expect(page.getByRole('button', { name: /^pen$/i })).toHaveAttribute('aria-pressed', 'true');
});

test('4B.9 download link points at material file endpoint', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, { meta: metaResponse('pdf'), includePdf: true });
  await page.goto(`/materials/view/${ATTACH_ID}`);
  await expect(page.getByRole('link', { name: /download/i })).toHaveAttribute(
    'href',
    new RegExp(`/materials/files/${ATTACH_ID}`),
    { timeout: 15_000 },
  );
});

test('4B.5 annotation edit debounces PUT save (pen stroke)', async ({ page }) => {
  let saveHit = false;
  await suppressTour(page);
  await routeMaterialViewerApis(page, {
    meta: metaResponse('pdf'),
    includePdf: true,
    onAnnotationSave: () => { saveHit = true; },
  });
  await page.goto(`/materials/view/${ATTACH_ID}`);
  await expect(page.getByRole('button', { name: /^pen$/i })).toBeVisible({ timeout: 20_000 });

  const canvas = page.locator('[class*="canvasWrap"] canvas').first();
  await expect(canvas).toBeVisible({ timeout: 20_000 });
  const box = await canvas.boundingBox();
  if (!box) {
    test.skip(true, 'PDF canvas not measurable');
    return;
  }

  await page.getByRole('button', { name: /^pen$/i }).click();
  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + 120, { steps: 8 });
  await page.mouse.up();

  await expect.poll(() => saveHit, { timeout: 8_000 }).toBe(true);
  await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 6_000 });
});

test('4B.6 Plyr media player opens from audio deep link', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, {
    meta: metaResponse('audio'),
    includeAudio: true,
  });
  await page.goto(`/materials/view/${ATTACH_ID}`);
  await expect(page).toHaveURL(/\/materials/, { timeout: 10_000 });
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('heading', { name: /E2E Seed Book\.pdf/i })).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.plyr, [data-plyr]').first()).toBeVisible({ timeout: 15_000 });
});

test('4B.7 file endpoint returns 206 for Range request (mocked)', async ({ page }) => {
  await suppressTour(page);
  await routeMaterialViewerApis(page, { meta: metaResponse('pdf'), includePdf: true });
  const res = await page.request.get(`/api/materials/files/${ATTACH_ID}`, {
    headers: { Range: 'bytes=0-511' },
  });
  expect(res.status()).toBe(206);
  expect(res.headers()['content-range']).toMatch(/bytes 0-511\//);
  expect(res.headers()['accept-ranges']).toBe('bytes');
});
