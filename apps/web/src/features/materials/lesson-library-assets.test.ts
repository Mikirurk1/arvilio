import {
  defaultLessonLibraryMediaShare,
  effectiveSharedLibraryAssetIds,
  filterLibraryAssetsForLessonViewer,
  isAssetSharedWithStudent,
  splitLibraryAssetsForLessonViewer,
  toggleSharedLibraryAssetId,
} from './lesson-library-assets';

const assets = [
  {
    id: '1',
    role: 'student_book' as const,
    deliveryKind: 'file' as const,
    url: null,
    fileAttachmentId: 'a',
    label: null,
    sortOrder: 0,
    downloadPath: '/f/1',
    previewDownloadPath: null,
  },
  {
    id: '2',
    role: 'teacher_book' as const,
    deliveryKind: 'file' as const,
    url: null,
    fileAttachmentId: 'b',
    label: null,
    sortOrder: 1,
    downloadPath: '/f/2',
    previewDownloadPath: null,
  },
  {
    id: '3',
    role: 'audio' as const,
    deliveryKind: 'file' as const,
    url: null,
    fileAttachmentId: 'c',
    label: null,
    sortOrder: 2,
    downloadPath: '/f/3',
    previewDownloadPath: null,
  },
  {
    id: '4',
    role: 'video' as const,
    deliveryKind: 'file' as const,
    url: null,
    fileAttachmentId: 'd',
    label: null,
    sortOrder: 3,
    downloadPath: '/f/4',
    previewDownloadPath: null,
  },
];

describe('lesson-library-assets', () => {
  it('defaults to explicit selection with no optional media shared', () => {
    expect(defaultLessonLibraryMediaShare(assets)).toEqual({
      sharedLibraryAssetIds: [],
      libraryMediaSelectionApplied: true,
    });
  });

  it('hides unselected audio/video for students', () => {
    const filtered = filterLibraryAssetsForLessonViewer(assets, 'student', {
      libraryMediaSelectionApplied: true,
      sharedLibraryAssetIds: ['3'],
    });
    expect(filtered.map((asset) => asset.id)).toEqual(['1', '3']);
  });

  it('includes all optional media for legacy rows without selection applied', () => {
    expect(
      isAssetSharedWithStudent(assets[2]!, { libraryMediaSelectionApplied: false }),
    ).toBe(true);
    expect(
      filterLibraryAssetsForLessonViewer(assets, 'student', {
        libraryMediaSelectionApplied: false,
      }).map((a) => a.id),
    ).toEqual(['1', '3', '4']);
  });

  it('splits optional media for staff editing', () => {
    const split = splitLibraryAssetsForLessonViewer(assets, 'staff', {
      libraryMediaSelectionApplied: true,
      sharedLibraryAssetIds: [],
    });
    expect(split.coreAssets.map((asset) => asset.id)).toEqual(['1']);
    expect(split.optionalMediaAssets.map((asset) => asset.id)).toEqual(['3', '4']);
    expect(split.teacherAssets.map((asset) => asset.id)).toEqual(['2']);
  });

  it('toggles shared asset ids', () => {
    expect(toggleSharedLibraryAssetId([], '3', true)).toEqual(['3']);
    expect(toggleSharedLibraryAssetId(['3'], '3', false)).toEqual([]);
  });

  it('shows all optional media as selected in legacy mode', () => {
    expect(
      effectiveSharedLibraryAssetIds(
        assets.filter((asset) => asset.role === 'audio' || asset.role === 'video'),
        { libraryMediaSelectionApplied: false },
      ),
    ).toEqual(['3', '4']);
  });
});
