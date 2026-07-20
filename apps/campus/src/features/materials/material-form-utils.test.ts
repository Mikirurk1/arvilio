import {
  buildAssetPayload,
  isAssetFilled,
  planMaterialSaveSteps,
  validateMaterialForm,
} from './material-form-utils';
import { computeOverallPercent } from './material-save-progress';
import type { MaterialAssetDraft } from './material-asset-presets';
import { newAssetFileEntry } from './material-asset-presets';

function draft(partial: Partial<MaterialAssetDraft>): MaterialAssetDraft {
  return {
    key: 'k1',
    role: 'link',
    deliveryKind: 'url',
    url: '',
    label: '',
    fileAttachmentId: null,
    pendingFile: null,
    fileName: null,
    ...partial,
  };
}

describe('material-form-utils', () => {
  it('isAssetFilled detects url and file assets', () => {
    expect(isAssetFilled(draft({ deliveryKind: 'url', url: 'https://x.com' }))).toBe(true);
    expect(isAssetFilled(draft({ deliveryKind: 'url', url: '  ' }))).toBe(false);
    expect(isAssetFilled(draft({ deliveryKind: 'file', fileAttachmentId: 'f1' }))).toBe(true);
  });

  it('buildAssetPayload skips empty rows', () => {
    const payload = buildAssetPayload([
      draft({ deliveryKind: 'url', url: 'https://miro.com' }),
      draft({ deliveryKind: 'url', url: '' }),
    ]);
    expect(payload).toHaveLength(1);
    expect(payload[0]?.url).toBe('https://miro.com');
  });

  it('validateMaterialForm requires board URL', () => {
    expect(
      validateMaterialForm({
        title: 'Board',
        kind: 'board',
        assets: [draft({ url: '' })],
      }),
    ).toMatch(/URL/);
  });

  it('planMaterialSaveSteps includes create, uploads, and finalize', () => {
    const file = new File(['x'], 'workbook.pdf', { type: 'application/pdf' });
    const steps = planMaterialSaveSteps(null, [
      draft({ deliveryKind: 'file', pendingFile: file, fileName: 'workbook.pdf' }),
    ]);
    expect(steps.map((step) => step.kind)).toEqual(['create', 'upload', 'compress', 'save']);
  });

  it('buildAssetPayload uses file name as label when custom label empty', () => {
    const payload = buildAssetPayload([
      draft({
        role: 'student_book',
        deliveryKind: 'file',
        fileAttachmentId: 'f1',
        fileName: 'Business Result.pdf',
      }),
    ]);
    expect(payload[0]?.label).toBe('Business Result.pdf');
  });

  it('buildAssetPayload expands multi-file audio drafts', () => {
    const payload = buildAssetPayload([
      draft({
        role: 'audio',
        deliveryKind: 'file',
        files: [
          newAssetFileEntry({ fileAttachmentId: 'f1', fileName: 'a.mp3' }),
          newAssetFileEntry({ fileAttachmentId: 'f2', fileName: 'b.mp3' }),
        ],
      }),
    ]);
    expect(payload).toHaveLength(2);
    expect(payload.every((row) => row.role === 'audio')).toBe(true);
  });

  it('validateMaterialForm rejects link file delivery', () => {
    expect(
      validateMaterialForm({
        title: 'X',
        kind: 'other',
        assets: [
          draft({
            role: 'link',
            deliveryKind: 'file',
            pendingFile: new File(['x'], 'x.pdf', { type: 'application/pdf' }),
          }),
        ],
      }),
    ).toMatch(/URL/i);
  });

  it('validateMaterialForm rejects oversized files', () => {
    const big = new File([new Uint8Array(101 * 1024 * 1024)], 'book.pdf', {
      type: 'application/pdf',
    });
    expect(
      validateMaterialForm({
        title: 'Book',
        kind: 'book',
        assets: [
          draft({
            role: 'student_book',
            deliveryKind: 'file',
            pendingFile: big,
            fileName: 'book.pdf',
          }),
        ],
      }),
    ).toMatch(/too large/i);
  });

  it('computeOverallPercent advances with upload progress', () => {
    expect(computeOverallPercent(2, 4, 0.5, 'upload')).toBeGreaterThan(
      computeOverallPercent(1, 4, 1, 'save'),
    );
  });
});
