import type { LibraryMaterialKindName } from '@pkg/types';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, FileText, Presentation } from 'lucide-react';

export type MaterialKindTone = 'board' | 'presentation' | 'book' | 'other';

export type LibraryKindMeta = {
  label: string;
  shortHint: string;
  Icon: LucideIcon;
  tone: MaterialKindTone;
};

export const LIBRARY_KIND_META: Record<LibraryMaterialKindName, LibraryKindMeta> = {
  board: {
    label: 'Board',
    shortHint: 'Miro, FigJam, whiteboards',
    Icon: FileText,
    tone: 'board',
  },
  presentation: {
    label: 'Presentation',
    shortHint: 'Slides, Canva, Google Slides',
    Icon: Presentation,
    tone: 'presentation',
  },
  book: {
    label: 'Book',
    shortHint: 'Student book, workbook, audio',
    Icon: BookOpen,
    tone: 'book',
  },
  other: {
    label: 'Other',
    shortHint: 'Any reusable resource',
    Icon: FileText,
    tone: 'other',
  },
};

export const LIBRARY_KIND_OPTIONS = (
  Object.entries(LIBRARY_KIND_META) as [LibraryMaterialKindName, LibraryKindMeta][]
).map(([value, meta]) => ({ value, ...meta }));

export function libraryKindMeta(kind: LibraryMaterialKindName): LibraryKindMeta {
  return LIBRARY_KIND_META[kind];
}
