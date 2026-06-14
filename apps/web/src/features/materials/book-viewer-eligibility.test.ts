import { describe, expect, it } from '@jest/globals';
import { isAnnotatableBookAsset, isStudentFacingBookAsset } from './book-viewer-eligibility';

describe('book-viewer-eligibility', () => {
  it('detects PDF book assets', () => {
    expect(
      isAnnotatableBookAsset({
        role: 'student_book',
        deliveryKind: 'file',
        fileAttachmentId: 'file-1',
        downloadPath: '/materials/files/file-1',
      }),
    ).toBe(true);
  });

  it('rejects audio assets', () => {
    expect(
      isAnnotatableBookAsset({
        role: 'audio',
        deliveryKind: 'file',
        fileAttachmentId: 'file-1',
        downloadPath: '/materials/files/file-1',
      }),
    ).toBe(false);
  });

  it('marks student-facing book roles', () => {
    expect(isStudentFacingBookAsset({ role: 'workbook' })).toBe(true);
    expect(isStudentFacingBookAsset({ role: 'teacher_book' })).toBe(false);
  });
});
