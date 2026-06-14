import { isBookTitlePageRole, isPdfAttachment } from './material-pdf-preview';

describe('material-pdf-preview', () => {
  it('detects book title page roles', () => {
    expect(isBookTitlePageRole('STUDENT_BOOK')).toBe(true);
    expect(isBookTitlePageRole('TEACHER_BOOK')).toBe(true);
    expect(isBookTitlePageRole('WORKBOOK')).toBe(true);
    expect(isBookTitlePageRole('AUDIO')).toBe(false);
  });

  it('detects pdf attachments', () => {
    expect(isPdfAttachment('application/pdf', 'book.pdf')).toBe(true);
    expect(isPdfAttachment('application/octet-stream', 'book.PDF')).toBe(true);
    expect(isPdfAttachment('image/jpeg', 'cover.jpg')).toBe(false);
  });
});
