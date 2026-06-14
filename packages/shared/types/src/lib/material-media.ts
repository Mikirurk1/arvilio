import type { LibraryMaterialAssetRoleName } from './shared-types';

export type MaterialViewerMediaKind = 'audio' | 'video' | 'pdf' | 'other';

export type MaterialAttachmentMetaDto = {
  fileAttachmentId: string;
  fileName: string;
  mimeType: string;
  mediaKind: MaterialViewerMediaKind;
  assetRole: LibraryMaterialAssetRoleName | null;
};

export type LibraryCaptionTrackKind = 'source' | 'translation';

export type LibraryCaptionTrackStatus = 'pending' | 'processing' | 'ready' | 'failed';

export type LibraryCaptionTrackDto = {
  id: string;
  language: string;
  kind: LibraryCaptionTrackKind;
  status: LibraryCaptionTrackStatus;
  label: string;
  errorMessage: string | null;
};

export type LibraryFileCaptionsResponseDto = {
  tracks: LibraryCaptionTrackDto[];
};
