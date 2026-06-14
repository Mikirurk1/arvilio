import type {
  MaterialAnnotationDocument,
  MaterialPageAnnotation,
  MaterialTextAnnotation,
} from '@pkg/types';

export type PageSize = { width: number; height: number };

export function pageKey(pageIndex: number): string {
  return String(pageIndex);
}

export function normPoint(x: number, y: number, size: PageSize): [number, number] {
  return [
    size.width > 0 ? x / size.width : 0,
    size.height > 0 ? y / size.height : 0,
  ];
}

export function denormX(value: number, width: number): number {
  return value * width;
}

export function denormY(value: number, height: number): number {
  return value * height;
}

export function denormPenPoints(points: number[], size: PageSize): number[] {
  const out: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    out.push(denormX(points[i] ?? 0, size.width), denormY(points[i + 1] ?? 0, size.height));
  }
  return out;
}

export function normalizePenPoints(points: number[], size: PageSize): number[] {
  const out: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    const [nx, ny] = normPoint(points[i] ?? 0, points[i + 1] ?? 0, size);
    out.push(nx, ny);
  }
  return out;
}

export function appendAnnotation(
  document: MaterialAnnotationDocument,
  pageIndex: number,
  annotation: MaterialPageAnnotation,
): MaterialAnnotationDocument {
  const key = pageKey(pageIndex);
  const existing = document.pages[key] ?? [];
  return {
    ...document,
    pages: {
      ...document.pages,
      [key]: [...existing, annotation],
    },
  };
}

export function updateAnnotation(
  document: MaterialAnnotationDocument,
  pageIndex: number,
  annotationId: string,
  next: MaterialPageAnnotation,
): MaterialAnnotationDocument {
  const key = pageKey(pageIndex);
  const existing = document.pages[key] ?? [];
  return {
    ...document,
    pages: {
      ...document.pages,
      [key]: existing.map((item) => (item.id === annotationId ? next : item)),
    },
  };
}

export function defaultTextBoxSize(size: PageSize, fontSize: number): Pick<
  MaterialTextAnnotation,
  'width' | 'height' | 'fontSize'
> {
  return {
    width: size.width > 0 ? Math.min(0.35, 180 / size.width) : 0.35,
    height: size.height > 0 ? Math.min(0.12, (fontSize * 3) / size.height) : 0.12,
    fontSize,
  };
}

export function newAnnotationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `ann-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeTextAnnotation(
  annotation: MaterialPageAnnotation,
): MaterialTextAnnotation | null {
  if (annotation.type !== 'text') return null;
  const text = annotation as MaterialTextAnnotation;
  return {
    ...text,
    width: text.width ?? 0.25,
    height: text.height ?? 0.08,
  };
}
