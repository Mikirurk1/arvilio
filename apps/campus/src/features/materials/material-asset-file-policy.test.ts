import {
  clearAssetFileIfRoleMismatch,
  fileRejectionMessage,
  isFileAllowedForMaterialAssetRole,
  isUrlOnlyAssetRole,
  materialAssetFilePolicy,
  roleAllowsFileUpload,
} from './material-asset-file-policy';
import {
  collectPendingMaterialUploads,
  isMultiFileAssetRole,
  newAssetFileEntry,
} from './material-asset-presets';

describe('material-asset-file-policy', () => {
  it('materialAssetFilePolicy returns role-specific accept hints', () => {
    expect(materialAssetFilePolicy('audio').hint).toContain('MP3');
    expect(materialAssetFilePolicy('audio').allowMultiple).toBe(true);
    expect(materialAssetFilePolicy('slides').accept).toContain('.pptx');
    expect(materialAssetFilePolicy('video').accept).toContain('video/');
  });

  it('link role disallows file upload', () => {
    expect(roleAllowsFileUpload('link')).toBe(false);
    expect(isUrlOnlyAssetRole('link')).toBe(true);
    expect(
      isFileAllowedForMaterialAssetRole({ name: 'lesson.pdf', type: 'application/pdf' }, 'link'),
    ).toBe(false);
  });

  it('isFileAllowedForMaterialAssetRole checks extension', () => {
    expect(
      isFileAllowedForMaterialAssetRole({ name: 'lesson.mp3', type: '' }, 'audio'),
    ).toBe(true);
    expect(
      isFileAllowedForMaterialAssetRole({ name: 'lesson.mp3', type: '' }, 'video'),
    ).toBe(false);
    expect(
      isFileAllowedForMaterialAssetRole({ name: 'deck.pptx', type: '' }, 'slides'),
    ).toBe(true);
  });

  it('clearAssetFileIfRoleMismatch drops incompatible single-file assets', () => {
    const file = new File(['x'], 'track.mp3', { type: 'audio/mpeg' });
    expect(
      clearAssetFileIfRoleMismatch(
        {
          deliveryKind: 'file',
          pendingFile: file,
          fileName: 'track.mp3',
          fileAttachmentId: 'a1',
        },
        'student_book',
      ),
    ).toEqual({
      pendingFile: null,
      fileName: null,
      fileAttachmentId: null,
      files: undefined,
    });
  });

  it('fileRejectionMessage includes role hint', () => {
    expect(fileRejectionMessage('audio', 'clip.mp4')).toContain('MP3');
    expect(fileRejectionMessage('link', 'clip.mp4')).toMatch(/URL/i);
  });
});

describe('multi-file asset presets', () => {
  it('collectPendingMaterialUploads gathers files from multi-file drafts', () => {
    const f1 = new File(['a'], 'a.mp3', { type: 'audio/mpeg' });
    const f2 = new File(['b'], 'b.mp3', { type: 'audio/mpeg' });
    const uploads = collectPendingMaterialUploads([
      {
        key: 'k1',
        role: 'audio',
        deliveryKind: 'file',
        url: '',
        label: '',
        fileAttachmentId: null,
        pendingFile: null,
        fileName: null,
        files: [
          newAssetFileEntry({ pendingFile: f1, fileName: 'a.mp3' }),
          newAssetFileEntry({ pendingFile: f2, fileName: 'b.mp3' }),
        ],
      },
    ]);
    expect(uploads).toHaveLength(2);
    expect(isMultiFileAssetRole('audio')).toBe(true);
  });
});
