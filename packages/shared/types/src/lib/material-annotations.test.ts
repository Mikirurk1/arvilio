import {
  emptyMaterialAnnotationDocument,
  validateMaterialAnnotationDocument,
} from '@pkg/types';

describe('material-annotations', () => {
  it('accepts empty document', () => {
    expect(validateMaterialAnnotationDocument(emptyMaterialAnnotationDocument())).toBe(true);
  });

  it('rejects wrong version', () => {
    expect(validateMaterialAnnotationDocument({ version: 2, pages: {} })).toBe(false);
  });

  it('accepts pen stroke on page 0', () => {
    const doc = emptyMaterialAnnotationDocument();
    doc.pages['0'] = [
      {
        id: 'x',
        type: 'pen',
        color: '#000',
        strokeWidth: 2,
        points: [0, 0, 1, 1],
      },
    ];
    expect(validateMaterialAnnotationDocument(doc)).toBe(true);
  });
});
