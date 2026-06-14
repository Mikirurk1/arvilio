import { isInAppMediaAsset } from './media-viewer-eligibility';

describe('media-viewer-eligibility', () => {
  it('accepts audio/video file assets with attachment id', () => {
    expect(
      isInAppMediaAsset({
        role: 'audio',
        deliveryKind: 'file',
        fileAttachmentId: 'a1',
        downloadPath: '/materials/files/a1',
      }),
    ).toBe(true);
    expect(
      isInAppMediaAsset({
        role: 'video',
        deliveryKind: 'file',
        fileAttachmentId: 'v1',
        downloadPath: '/materials/files/v1',
      }),
    ).toBe(true);
  });

  it('rejects books and url-only assets', () => {
    expect(
      isInAppMediaAsset({
        role: 'student_book',
        deliveryKind: 'file',
        fileAttachmentId: 'b1',
        downloadPath: '/materials/files/b1',
      }),
    ).toBe(false);
    expect(
      isInAppMediaAsset({
        role: 'audio',
        deliveryKind: 'url',
        fileAttachmentId: null,
        downloadPath: null,
      }),
    ).toBe(false);
  });
});
