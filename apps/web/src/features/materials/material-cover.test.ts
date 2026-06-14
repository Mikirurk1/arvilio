import type { LibraryMaterialDto } from '@pkg/types';
import { materialCoverImageHref } from './material-cover';

describe('material-cover', () => {
  it('prefers explicit material cover over asset previews', () => {
    const material = {
      coverDownloadPath: '/materials/files/cover-1',
      assets: [
        {
          role: 'student_book',
          previewDownloadPath: '/materials/files/student/preview',
        },
      ],
    } as unknown as LibraryMaterialDto;

    expect(materialCoverImageHref(material)).toBe('/api/materials/files/cover-1');
  });

  it('falls back to student book preview when no material cover', () => {
    const material = {
      coverDownloadPath: null,
      assets: [
        {
          role: 'teacher_book',
          previewDownloadPath: '/materials/files/teacher/preview',
        },
        {
          role: 'student_book',
          previewDownloadPath: '/materials/files/student/preview',
        },
      ],
    } as unknown as LibraryMaterialDto;

    expect(materialCoverImageHref(material)).toBe('/api/materials/files/student/preview');
  });
});
