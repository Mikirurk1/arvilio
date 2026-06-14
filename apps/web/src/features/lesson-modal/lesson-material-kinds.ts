import type { ComponentType } from 'react';
import { BookOpen, File, FileText, Image, Monitor } from 'lucide-react';

export type MaterialKind =
  | 'text'
  | 'photo'
  | 'file'
  | 'presentation'
  | 'book'
  | 'board'
  | 'test';

export type MaterialKindOption = {
  value: MaterialKind;
  label: string;
  icon: ComponentType<{ size?: number }>;
};

/** Lesson modal material type picker (manual uploads). Legacy `test` omitted. */
export const LESSON_MATERIAL_KIND_OPTIONS: MaterialKindOption[] = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'book', label: 'Book', icon: BookOpen },
  { value: 'board', label: 'Board', icon: FileText },
  { value: 'file', label: 'File', icon: File },
  { value: 'presentation', label: 'Presentation', icon: Monitor },
];

const LEGACY_KIND_LABELS: Partial<Record<MaterialKind, string>> = {
  test: 'Test',
};

export function lessonMaterialKindOption(
  kind: MaterialKind,
  labels?: Partial<Record<MaterialKind, string>>,
): MaterialKindOption | undefined {
  const fromList = LESSON_MATERIAL_KIND_OPTIONS.find((option) => option.value === kind);
  if (fromList) {
    const label = labels?.[kind];
    return label ? { ...fromList, label } : fromList;
  }
  const legacyLabel = labels?.[kind] ?? LEGACY_KIND_LABELS[kind];
  if (!legacyLabel) return undefined;
  return { value: kind, label: legacyLabel, icon: FileText };
}
