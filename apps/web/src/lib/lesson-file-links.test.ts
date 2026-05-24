import type { LessonFileLinkDto } from '@pkg/types';
import {
  buildFilePreviewsFromLinks,
  buildFilePreviewsResolvingPending,
  buildMaterialPreviewsFromLesson,
  lessonFileDisplayName,
  lessonFileDownloadUrl,
  resolveLessonFilePreview,
} from './lesson-file-links';

describe('lesson-file-links', () => {
  const links: LessonFileLinkDto[] = [
    { ref: 'att:file-1', fileName: 'Notes.pdf', downloadPath: '/lessons/files/file-1' },
  ];

  it('lessonFileDownloadUrl prefixes API base for relative paths', () => {
    expect(lessonFileDownloadUrl('/lessons/files/x')).toContain('/lessons/files/x');
    expect(lessonFileDownloadUrl('https://cdn.test/f.pdf')).toBe('https://cdn.test/f.pdf');
    expect(lessonFileDownloadUrl(null)).toBeNull();
  });

  it('lessonFileDisplayName prefers link fileName', () => {
    expect(lessonFileDisplayName('att:file-1', links, 0)).toBe('Notes.pdf');
    expect(lessonFileDisplayName('legacy-name', undefined, 0)).toBe('legacy-name');
  });

  it('buildFilePreviewsFromLinks and resolveLessonFilePreview', () => {
    expect(buildFilePreviewsFromLinks(['att:file-1'], links)[0]).toContain('/lessons/files/file-1');
    expect(resolveLessonFilePreview('local.pdf', links, 0, 'blob:pending')).toBe('blob:pending');
    expect(resolveLessonFilePreview('att:file-1', links, 0, 'blob:pending')).toContain(
      '/lessons/files/file-1',
    );
  });

  it('buildMaterialPreviewsFromLesson maps each material file', () => {
    const previews = buildMaterialPreviewsFromLesson([
      { id: 'm1', files: ['att:file-1'], fileLinks: links },
    ]);
    expect(previews.m1?.[0]).toContain('/lessons/files/file-1');
  });

  it('buildFilePreviewsResolvingPending keeps pending blob for local names', () => {
    const previews = buildFilePreviewsResolvingPending(
      ['att:file-1', 'draft.pdf'],
      links,
      [null, 'blob:draft'],
    );
    expect(previews[0]).toContain('/lessons/files/file-1');
    expect(previews[1]).toBe('blob:draft');
  });
});
