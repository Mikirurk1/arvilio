import type {
  LibraryMaterialAssetRoleName,
  LibraryMaterialKindName,
} from '@pkg/types';

export type MaterialAssetFileEntry = {
  clientKey: string;
  pendingFile: File | null;
  fileAttachmentId: string | null;
  fileName: string | null;
  downloadPath?: string | null;
  previewDownloadPath?: string | null;
};

export type MaterialAssetDraft = {
  key: string;
  role: LibraryMaterialAssetRoleName;
  deliveryKind: 'url' | 'file';
  url: string;
  label: string;
  fileAttachmentId: string | null;
  pendingFile: File | null;
  fileName: string | null;
  downloadPath?: string | null;
  previewDownloadPath?: string | null;
  /** Multiple files for audio / video / slides (one backend asset per file on save). */
  files?: MaterialAssetFileEntry[];
};

export const MULTI_FILE_ASSET_ROLES = ['audio', 'video', 'slides'] as const;

export type MultiFileAssetRole = (typeof MULTI_FILE_ASSET_ROLES)[number];

export const URL_ONLY_ASSET_ROLES = ['link'] as const;

export function isMultiFileAssetRole(
  role: LibraryMaterialAssetRoleName,
): role is MultiFileAssetRole {
  return (MULTI_FILE_ASSET_ROLES as readonly string[]).includes(role);
}

export function isUrlOnlyAssetRole(role: LibraryMaterialAssetRoleName): boolean {
  return (URL_ONLY_ASSET_ROLES as readonly string[]).includes(role);
}

export function roleAllowsFileUpload(role: LibraryMaterialAssetRoleName): boolean {
  return !isUrlOnlyAssetRole(role);
}

export function newAssetFileEntry(
  partial?: Partial<Omit<MaterialAssetFileEntry, 'clientKey'>>,
): MaterialAssetFileEntry {
  return {
    clientKey: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    pendingFile: null,
    fileAttachmentId: null,
    fileName: null,
    ...partial,
  };
}

export function assetFileEntries(asset: MaterialAssetDraft): MaterialAssetFileEntry[] {
  if (asset.deliveryKind !== 'file') return [];
  if (isMultiFileAssetRole(asset.role)) {
    return asset.files ?? [];
  }
  if (asset.pendingFile || asset.fileAttachmentId || asset.fileName) {
    return [
      {
        clientKey: 'single',
        pendingFile: asset.pendingFile,
        fileAttachmentId: asset.fileAttachmentId,
        fileName: asset.fileName,
      },
    ];
  }
  return [];
}

export type PendingMaterialUpload = {
  draftIndex: number;
  fileEntryKey: string;
  file: File;
};

export function collectPendingMaterialUploads(assets: MaterialAssetDraft[]): PendingMaterialUpload[] {
  const uploads: PendingMaterialUpload[] = [];
  assets.forEach((asset, draftIndex) => {
    if (asset.deliveryKind !== 'file') return;
    for (const entry of assetFileEntries(asset)) {
      if (!entry.pendingFile) continue;
      uploads.push({
        draftIndex,
        fileEntryKey: entry.clientKey,
        file: entry.pendingFile,
      });
    }
  });
  return uploads;
}

export const LIBRARY_KIND_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'board', label: 'Boards' },
  { value: 'presentation', label: 'Presentations' },
  { value: 'book', label: 'Books' },
  { value: 'other', label: 'Other' },
] as const;

export type LibraryKindFilter = (typeof LIBRARY_KIND_FILTER_OPTIONS)[number]['value'];

export const LIBRARY_ASSET_ROLE_LABELS: Record<LibraryMaterialAssetRoleName, string> = {
  student_book: 'Student book',
  teacher_book: 'Teacher book',
  workbook: 'Workbook',
  audio: 'Audio',
  video: 'Video',
  slides: 'Slides',
  link: 'Link',
  other: 'Other',
};

export const LIBRARY_KIND_LABELS: Record<LibraryMaterialKindName, string> = {
  board: 'Board',
  presentation: 'Presentation',
  book: 'Book',
  other: 'Other',
};

function emptyAssetDraft(
  role: LibraryMaterialAssetRoleName,
  deliveryKind: 'url' | 'file' = 'url',
): MaterialAssetDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    deliveryKind,
    url: '',
    label: '',
    fileAttachmentId: null,
    pendingFile: null,
    fileName: null,
    files: isMultiFileAssetRole(role) ? [] : undefined,
  };
}

export function defaultAssetsForKind(kind: LibraryMaterialKindName): MaterialAssetDraft[] {
  if (kind === 'board' || kind === 'presentation') {
    return [emptyAssetDraft('link')];
  }
  if (kind === 'book') {
    return [
      emptyAssetDraft('student_book'),
      emptyAssetDraft('teacher_book'),
      emptyAssetDraft('workbook'),
      emptyAssetDraft('audio'),
    ];
  }
  return [emptyAssetDraft('link')];
}

export function libraryKindToLessonMaterialKind(
  kind: LibraryMaterialKindName,
): 'text' | 'photo' | 'test' | 'file' | 'presentation' | 'book' | 'board' {
  switch (kind) {
    case 'board':
      return 'board';
    case 'presentation':
      return 'presentation';
    case 'book':
      return 'book';
    default:
      return 'file';
  }
}

export function newAssetDraft(role: LibraryMaterialAssetRoleName = 'other'): MaterialAssetDraft {
  return emptyAssetDraft(role);
}

export function normalizeAssetDraftForRole(
  asset: MaterialAssetDraft,
  role: LibraryMaterialAssetRoleName,
  isFileAllowed: (file: Pick<File, 'name' | 'type'>) => boolean,
): Partial<MaterialAssetDraft> {
  if (isUrlOnlyAssetRole(role)) {
    return {
      role,
      deliveryKind: 'url',
      url: asset.deliveryKind === 'url' ? asset.url : '',
      pendingFile: null,
      fileName: null,
      fileAttachmentId: null,
      files: undefined,
    };
  }

  if (isMultiFileAssetRole(role)) {
    const merged: MaterialAssetFileEntry[] = [...(asset.files ?? [])];
    if (asset.pendingFile || asset.fileAttachmentId || asset.fileName) {
      merged.push(
        newAssetFileEntry({
          pendingFile: asset.pendingFile,
          fileAttachmentId: asset.fileAttachmentId,
          fileName: asset.fileName,
        }),
      );
    }

    const files = merged.filter((entry) => {
      const probe = entry.pendingFile ?? (entry.fileName ? { name: entry.fileName, type: '' } : null);
      if (!probe) return Boolean(entry.fileAttachmentId);
      return isFileAllowed(probe);
    });

    return {
      role,
      deliveryKind: asset.deliveryKind === 'file' || files.length > 0 ? 'file' : asset.deliveryKind,
      pendingFile: null,
      fileName: null,
      fileAttachmentId: null,
      files,
    };
  }

  const firstValid = (asset.files ?? []).find((entry) => {
    const probe = entry.pendingFile ?? (entry.fileName ? { name: entry.fileName, type: '' } : null);
    if (!probe) return Boolean(entry.fileAttachmentId);
    return isFileAllowed(probe);
  });

  const pendingFile = firstValid?.pendingFile ?? asset.pendingFile;
  const fileName = firstValid?.fileName ?? asset.fileName;
  const fileAttachmentId = firstValid?.fileAttachmentId ?? asset.fileAttachmentId;
  const probe = pendingFile ?? (fileName ? { name: fileName, type: '' } : null);

  if (asset.deliveryKind === 'file' && probe && !isFileAllowed(probe)) {
    return {
      role,
      deliveryKind: 'file',
      pendingFile: null,
      fileName: null,
      fileAttachmentId: null,
      files: undefined,
    };
  }

  return {
    role,
    files: undefined,
    pendingFile,
    fileName,
    fileAttachmentId,
  };
}
