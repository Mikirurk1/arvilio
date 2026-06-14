/** Vector annotation document stored per user + library file attachment. */

export const MATERIAL_ANNOTATION_DOCUMENT_VERSION = 1 as const;

export type MaterialAnnotationDocumentVersion = typeof MATERIAL_ANNOTATION_DOCUMENT_VERSION;

export type MaterialAnnotationBase = {
  id: string;
  color: string;
  strokeWidth: number;
};

export type MaterialPenAnnotation = MaterialAnnotationBase & {
  type: 'pen';
  /** Normalized polyline [x0, y0, x1, y1, ...] in 0–1 page space. */
  points: number[];
};

export type MaterialRectAnnotation = MaterialAnnotationBase & {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MaterialEllipseAnnotation = MaterialAnnotationBase & {
  type: 'ellipse';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
};

export type MaterialArrowAnnotation = MaterialAnnotationBase & {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type MaterialTextAnnotation = MaterialAnnotationBase & {
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
};

export type MaterialPageAnnotation =
  | MaterialPenAnnotation
  | MaterialRectAnnotation
  | MaterialEllipseAnnotation
  | MaterialArrowAnnotation
  | MaterialTextAnnotation;

export type MaterialAnnotationDocument = {
  version: MaterialAnnotationDocumentVersion;
  /** 0-based page index as string key. */
  pages: Record<string, MaterialPageAnnotation[]>;
};

export type MaterialAnnotationTool =
  | 'select'
  | 'pen'
  | 'rect'
  | 'ellipse'
  | 'arrow'
  | 'text';

export type LibraryFileAnnotationResponseDto = {
  /** Student / owner base layer (read-only when staff reviews). */
  document: MaterialAnnotationDocument;
  /** Staff overlay on subjectUserId's book; editable by the overlay author. */
  overlayDocument: MaterialAnnotationDocument;
  updatedAt: string | null;
  overlayUpdatedAt: string | null;
  readOnly: boolean;
  canEditOverlay: boolean;
  canClearOverlay: boolean;
  fileRevision: string | null;
  fileName: string;
  materialId: string;
  subjectUserId: string;
  subjectDisplayName: string | null;
};

export type SaveLibraryFileAnnotationRequestDto = {
  document: MaterialAnnotationDocument;
  fileRevision?: string | null;
  /** When set, save staff overlay on this student's book. */
  contextUserId?: string | null;
};

export function emptyMaterialAnnotationDocument(): MaterialAnnotationDocument {
  return { version: MATERIAL_ANNOTATION_DOCUMENT_VERSION, pages: {} };
}

export function computeLibraryFileRevision(sizeBytes: number, storageKey: string): string {
  return `${sizeBytes}:${storageKey}`;
}

const MAX_ANNOTATION_JSON_BYTES = 512 * 1024;

export function validateMaterialAnnotationDocument(
  document: unknown,
): document is MaterialAnnotationDocument {
  if (!document || typeof document !== 'object') return false;
  const doc = document as MaterialAnnotationDocument;
  if (doc.version !== MATERIAL_ANNOTATION_DOCUMENT_VERSION) return false;
  if (!doc.pages || typeof doc.pages !== 'object') return false;
  for (const key of Object.keys(doc.pages)) {
    if (!/^\d+$/.test(key)) return false;
    const items = doc.pages[key];
    if (!Array.isArray(items)) return false;
    for (const item of items) {
      if (!item || typeof item !== 'object') return false;
      if (typeof item.id !== 'string') return false;
      if (typeof item.type !== 'string') return false;
      if (typeof item.color !== 'string') return false;
      if (typeof item.strokeWidth !== 'number') return false;
      if (item.type === 'text') {
        const textItem = item as MaterialTextAnnotation;
        if (typeof textItem.text !== 'string') return false;
        if (typeof textItem.fontSize !== 'number') return false;
        if (typeof textItem.x !== 'number' || typeof textItem.y !== 'number') return false;
        if (textItem.width !== undefined && typeof textItem.width !== 'number') return false;
        if (textItem.height !== undefined && typeof textItem.height !== 'number') return false;
      }
    }
  }
  try {
    if (JSON.stringify(doc).length > MAX_ANNOTATION_JSON_BYTES) return false;
  } catch {
    return false;
  }
  return true;
}
