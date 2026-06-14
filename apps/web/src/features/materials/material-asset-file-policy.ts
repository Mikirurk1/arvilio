import type { LibraryMaterialAssetRoleName } from '@pkg/types';
import {
  isMultiFileAssetRole,
  isUrlOnlyAssetRole,
  roleAllowsFileUpload,
} from './material-asset-presets';

/** Subset of backend `MaterialAttachmentService` allowed types. */
export const MATERIAL_UPLOAD_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
  '.svg',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.mp3',
  '.wav',
  '.m4a',
  '.ogg',
  '.webm',
  '.mp4',
] as const;

const BOOK_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'] as const;
const WORKBOOK_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'] as const;
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg'] as const;
const VIDEO_EXTENSIONS = ['.mp4', '.webm'] as const;
const SLIDES_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp'] as const;

export type MaterialAssetFilePolicy = {
  extensions: readonly string[];
  mimePrefixes: readonly string[];
  accept: string;
  hint: string;
  allowMultiple: boolean;
};

const ROLE_POLICIES: Record<LibraryMaterialAssetRoleName, MaterialAssetFilePolicy> = {
  student_book: policy(
    BOOK_EXTENSIONS,
    ['application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats'],
    'PDF, Word (.doc/.docx), or plain text',
    false,
  ),
  teacher_book: policy(
    BOOK_EXTENSIONS,
    ['application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats'],
    'PDF, Word (.doc/.docx), or plain text',
    false,
  ),
  workbook: policy(
    WORKBOOK_EXTENSIONS,
    [
      'application/pdf',
      'text/',
      'application/msword',
      'application/vnd.openxmlformats',
      'application/vnd.ms-excel',
    ],
    'PDF, Word, Excel (.xls/.xlsx), or plain text',
    false,
  ),
  audio: policy(AUDIO_EXTENSIONS, ['audio/'], 'MP3, WAV, M4A, or OGG — add multiple tracks', true),
  video: policy(VIDEO_EXTENSIONS, ['video/'], 'MP4 or WebM — add multiple clips', true),
  slides: policy(
    SLIDES_EXTENSIONS,
    ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats', 'image/'],
    'PDF, PowerPoint (PPT/PPTX), or images — add multiple files',
    true,
  ),
  link: policy([], [], 'URL only — file upload is not available for Link', false),
  other: policy(
    MATERIAL_UPLOAD_EXTENSIONS,
    [
      'image/',
      'application/pdf',
      'text/',
      'application/vnd',
      'application/msword',
      'audio/',
      'video/',
    ],
    'Documents, images, audio, or video',
    false,
  ),
};

function policy(
  extensions: readonly string[],
  mimePrefixes: readonly string[],
  hint: string,
  allowMultiple: boolean,
): MaterialAssetFilePolicy {
  const accept = [...mimePrefixes, ...extensions].join(',');
  return { extensions, mimePrefixes, accept, hint, allowMultiple };
}

export function materialAssetFilePolicy(role: LibraryMaterialAssetRoleName): MaterialAssetFilePolicy {
  return ROLE_POLICIES[role];
}

export function isFileAllowedForMaterialAssetRole(
  file: Pick<File, 'name' | 'type'>,
  role: LibraryMaterialAssetRoleName,
): boolean {
  if (!roleAllowsFileUpload(role)) return false;
  const { extensions, mimePrefixes } = materialAssetFilePolicy(role);
  const lower = file.name.toLowerCase();
  const hasExtension = extensions.some((ext) => lower.endsWith(ext));
  const mime = file.type.toLowerCase();
  const hasMime = mime.length > 0 && mimePrefixes.some((prefix) => mime.startsWith(prefix));
  return hasExtension || hasMime;
}

export function fileRejectionMessage(role: LibraryMaterialAssetRoleName, fileName: string): string {
  if (isUrlOnlyAssetRole(role)) {
    return 'Link assets must use a URL — file upload is not available.';
  }
  const { hint } = materialAssetFilePolicy(role);
  return `"${fileName}" is not allowed for this role. Allowed: ${hint}.`;
}

export { isMultiFileAssetRole, isUrlOnlyAssetRole, roleAllowsFileUpload };

export function clearAssetFileIfRoleMismatch(
  asset: {
    deliveryKind: 'url' | 'file';
    pendingFile: File | null;
    fileName: string | null;
    fileAttachmentId: string | null;
    files?: Array<{
      pendingFile: File | null;
      fileName: string | null;
      fileAttachmentId: string | null;
    }>;
  },
  role: LibraryMaterialAssetRoleName,
): {
  pendingFile: File | null;
  fileName: string | null;
  fileAttachmentId: string | null;
  files?: Array<{
    pendingFile: File | null;
    fileName: string | null;
    fileAttachmentId: string | null;
  }>;
} {
  if (isUrlOnlyAssetRole(role)) {
    return {
      pendingFile: null,
      fileName: null,
      fileAttachmentId: null,
      files: undefined,
    };
  }

  if (isMultiFileAssetRole(role)) {
    const files = (asset.files ?? []).filter((entry) => {
      const probe = entry.pendingFile ?? (entry.fileName ? { name: entry.fileName, type: '' } : null);
      if (!probe) return Boolean(entry.fileAttachmentId);
      return isFileAllowedForMaterialAssetRole(probe, role);
    });
    return {
      pendingFile: null,
      fileName: null,
      fileAttachmentId: null,
      files,
    };
  }

  if (asset.deliveryKind !== 'file') {
    return {
      pendingFile: asset.pendingFile,
      fileName: asset.fileName,
      fileAttachmentId: asset.fileAttachmentId,
      files: undefined,
    };
  }

  const checkName = asset.pendingFile?.name ?? asset.fileName;
  if (!checkName) {
    return {
      pendingFile: asset.pendingFile,
      fileName: asset.fileName,
      fileAttachmentId: asset.fileAttachmentId,
      files: undefined,
    };
  }

  const probe = asset.pendingFile ?? { name: checkName, type: '' };
  if (isFileAllowedForMaterialAssetRole(probe, role)) {
    return {
      pendingFile: asset.pendingFile,
      fileName: asset.fileName,
      fileAttachmentId: asset.fileAttachmentId,
      files: undefined,
    };
  }

  return {
    pendingFile: null,
    fileName: null,
    fileAttachmentId: null,
    files: undefined,
  };
}
