import {
  materialAssetPrimaryName,
  materialAssetSecondaryHint,
  summarizeMaterialAssets,
} from './material-asset-display';

describe('material-asset-display', () => {
  it('prefers file name over role label', () => {
    expect(
      materialAssetPrimaryName({
        role: 'student_book',
        deliveryKind: 'file',
        url: null,
        label: null,
        fileName: 'Business Result.pdf',
      }),
    ).toBe('Business Result.pdf');
  });

  it('shows role as secondary hint for files', () => {
    expect(
      materialAssetSecondaryHint({
        role: 'student_book',
        deliveryKind: 'file',
        url: null,
        label: null,
        fileName: 'Workbook.pdf',
      }),
    ).toBe('Student book');
  });

  it('summarizes many assets for compact grid cards', () => {
    const assets = [
      { role: 'student_book' as const, deliveryKind: 'file' as const, url: null, label: null, fileName: 'A.pdf' },
      { role: 'workbook' as const, deliveryKind: 'file' as const, url: null, label: null, fileName: 'B.pdf' },
      { role: 'audio' as const, deliveryKind: 'file' as const, url: null, label: null, fileName: 'C.mp3' },
    ];
    expect(summarizeMaterialAssets(assets, 2)).toBe('A.pdf · B.pdf · +1 more');
  });
});
