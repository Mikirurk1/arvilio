import { mockScheduledLesson } from '../testing/fixtures';
import { uploadLessonAttachment, uploadPendingLessonFiles } from './lesson-attachment-upload';

describe('lesson-attachment-upload', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('uploadLessonAttachment posts multipart form and returns payload', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'file-1',
        fileName: 'notes.pdf',
        ref: 'attachment:file-1',
        downloadPath: '/files/file-1',
      }),
    }) as typeof fetch;

    const file = new File(['x'], 'notes.pdf', { type: 'application/pdf' });
    const result = await uploadLessonAttachment('lesson-uuid', file);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/lessons/files/lesson-uuid'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    expect(result.ref).toBe('attachment:file-1');
  });

  it('uploadLessonAttachment surfaces server error message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'File too large' }),
    }) as typeof fetch;

    await expect(
      uploadLessonAttachment('lesson-uuid', new File(['x'], 'big.pdf')),
    ).rejects.toThrow('File too large');
  });

  it('uploadPendingLessonFiles uploads pending refs and keeps attachment refs', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'file-2',
        fileName: 'draft.pdf',
        ref: 'attachment:file-2',
        downloadPath: '/files/file-2',
      }),
    }) as typeof fetch;

    const lesson = mockScheduledLesson({
      materials: [
        { id: 'm1', kind: 'file', text: 'Material', files: ['draft.pdf', 'attachment:existing'], fileLinks: [] },
      ],
    });

    const pending = new File(['x'], 'draft.pdf');
    const updated = await uploadPendingLessonFiles('lesson-uuid', lesson, (key) =>
      key === 'material:m1:draft.pdf' ? pending : undefined,
    );

    expect(updated.materials?.[0]?.files).toEqual(['attachment:file-2', 'attachment:existing']);
  });
});
