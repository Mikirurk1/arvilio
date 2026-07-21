import type {
  CreateLibraryMaterialRequestDto,
  LibraryMaterialAssetInputDto,
  LibraryMaterialKindName,
} from '@pkg/types';
import { uploadLibraryMaterialFile } from '../../lib/material-upload';
import type { MaterialCompressLevel } from '../../lib/material-compress-level';
import {
  assetFileEntries,
  collectPendingMaterialUploads,
  type MaterialAssetDraft,
  type PendingMaterialUpload,
} from './material-asset-presets';
import {
  fileRejectionMessage,
  isFileAllowedForMaterialAssetRole,
} from './material-asset-file-policy';
import {
  isMaterialFileWithinSizeLimit,
  materialFileTooLargeMessage,
} from '../../lib/material-upload-limits';
import {
  clearMaterialPendingSave,
  markMaterialPendingSave,
} from './material-save-recovery';
import {
  emitSaveProgress,
  fileUploadPhases,
  planMaterialSaveSteps,
  stepIndexForKind,
  type MaterialSaveProgress,
  type MaterialSaveProgressReporter,
  type MaterialSaveStep,
} from './material-save-progress';

function applyUploadedFile(
  drafts: MaterialAssetDraft[],
  target: PendingMaterialUpload,
  uploaded: { id: string; fileName: string },
): MaterialAssetDraft[] {
  const next = [...drafts];
  const asset = next[target.draftIndex];
  if (!asset) return next;

  if (target.fileEntryKey === 'single') {
    next[target.draftIndex] = {
      ...asset,
      fileAttachmentId: uploaded.id,
      fileName: uploaded.fileName,
      pendingFile: null,
    };
    return next;
  }

  const files = (asset.files ?? []).map((entry) =>
    entry.clientKey === target.fileEntryKey
      ? {
          ...entry,
          fileAttachmentId: uploaded.id,
          fileName: uploaded.fileName,
          pendingFile: null,
        }
      : entry,
  );
  next[target.draftIndex] = { ...asset, files };
  return next;
}

export function isAssetFilled(asset: MaterialAssetDraft): boolean {
  if (asset.deliveryKind === 'url') return asset.url.trim().length > 0;
  return assetFileEntries(asset).some(
    (entry) => Boolean(entry.pendingFile || entry.fileAttachmentId),
  );
}

export function buildAssetPayload(drafts: MaterialAssetDraft[]): LibraryMaterialAssetInputDto[] {
  const payload: LibraryMaterialAssetInputDto[] = [];
  let sortOrder = 0;

  for (const asset of drafts.filter(isAssetFilled)) {
    const label = asset.label.trim() || undefined;

    if (asset.deliveryKind === 'url') {
      payload.push({
        role: asset.role,
        deliveryKind: 'url',
        url: asset.url.trim(),
        label,
        sortOrder: sortOrder++,
      });
      continue;
    }

    for (const entry of assetFileEntries(asset)) {
      if (!entry.fileAttachmentId) continue;
      payload.push({
        role: asset.role,
        deliveryKind: 'file',
        fileAttachmentId: entry.fileAttachmentId,
        label: asset.label.trim() || entry.fileName?.trim() || undefined,
        sortOrder: sortOrder++,
      });
    }
  }

  return payload;
}

export async function uploadPendingMaterialFiles(
  materialId: string,
  drafts: MaterialAssetDraft[],
  options?: {
    compressLevel?: MaterialCompressLevel;
    onProgress?: MaterialSaveProgressReporter;
    steps: MaterialSaveStep[];
  },
): Promise<{
  drafts: MaterialAssetDraft[];
  compressionSummaries: Array<{
    fileName: string;
    sizeBytes: number;
    originalSizeBytes: number;
    compressionCodec: string;
  }>;
}> {
  let next = [...drafts];
  const steps = options?.steps ?? planMaterialSaveSteps(materialId, drafts);
  const phases = fileUploadPhases(steps);
  const pending = collectPendingMaterialUploads(next);
  const compressionSummaries: Array<{
    fileName: string;
    sizeBytes: number;
    originalSizeBytes: number;
    compressionCodec: string;
  }> = [];

  for (let fileOrdinal = 0; fileOrdinal < pending.length; fileOrdinal += 1) {
    const target = pending[fileOrdinal]!;
    const phase = phases[fileOrdinal];
    if (!phase) continue;

    const { uploadStepIndex, compressStepIndex } = phase;

    emitSaveProgress(options?.onProgress, steps, uploadStepIndex, {
      fileProgress: 0,
      stepPhase: 'uploading',
    });

    const uploaded = await uploadLibraryMaterialFile(materialId, target.file, {
      compressLevel: options?.compressLevel ?? 'balanced',
      onProgress: (event) => {
        if (event.phase === 'compressing' && compressStepIndex) {
          emitSaveProgress(options?.onProgress, steps, compressStepIndex, {
            fileProgress: 0.72,
            stepPhase: 'compressing',
            uploadBytesLoaded: event.total,
            uploadBytesTotal: event.total,
          });
          return;
        }

        emitSaveProgress(options?.onProgress, steps, uploadStepIndex, {
          fileProgress: event.total > 0 ? event.loaded / event.total : 0,
          uploadBytesLoaded: event.loaded,
          uploadBytesTotal: event.total,
          stepPhase: 'uploading',
        });
      },
    });

    compressionSummaries.push({
      fileName: uploaded.fileName,
      sizeBytes: uploaded.sizeBytes,
      originalSizeBytes: uploaded.originalSizeBytes,
      compressionCodec: uploaded.compressionCodec,
    });

    if (compressStepIndex) {
      emitSaveProgress(options?.onProgress, steps, compressStepIndex, {
        fileProgress: 1,
        stepPhase: 'compressing',
        compressionSummaries: [...compressionSummaries],
      });
    }

    next = applyUploadedFile(next, target, uploaded);
  }

  return { drafts: next, compressionSummaries };
}

export function validateMaterialForm(input: {
  title: string;
  kind: LibraryMaterialKindName;
  assets: MaterialAssetDraft[];
}): string | null {
  if (!input.title.trim()) return 'Title is required';

  const filled = input.assets.filter(isAssetFilled);
  for (const asset of filled) {
    if (asset.deliveryKind === 'file') {
      const entries = assetFileEntries(asset);
      if (entries.length === 0 || entries.every((entry) => !entry.pendingFile && !entry.fileAttachmentId)) {
        return 'Choose a file or switch delivery to URL';
      }
      for (const entry of entries) {
        const probe =
          entry.pendingFile ??
          (entry.fileName ? { name: entry.fileName, type: '' as const } : null);
        if (probe && !isFileAllowedForMaterialAssetRole(probe, asset.role)) {
          return fileRejectionMessage(asset.role, probe.name);
        }
        if (entry.pendingFile && !isMaterialFileWithinSizeLimit(entry.pendingFile.size)) {
          return materialFileTooLargeMessage(entry.pendingFile.name);
        }
      }
    }
  }

  if (input.kind === 'board' || input.kind === 'presentation') {
    const hasUrl = filled.some((asset) => asset.deliveryKind === 'url' && asset.url.trim());
    if (!hasUrl) return 'Add a link URL for this material';
  }

  return null;
}

export async function persistLibraryMaterial(input: {
  baseBody: CreateLibraryMaterialRequestDto;
  assets: MaterialAssetDraft[];
  initialId?: string | null;
  cover?: {
    attachmentId: string | null;
    pendingFile: File | null;
    remove: boolean;
  };
  compressLevel?: MaterialCompressLevel;
  onSave: (body: CreateLibraryMaterialRequestDto) => Promise<{ id: string }>;
  onUpdate: (id: string, body: CreateLibraryMaterialRequestDto) => Promise<unknown>;
  onProgress?: MaterialSaveProgressReporter;
}): Promise<void> {
  const { baseBody, assets, initialId, cover, compressLevel = 'balanced', onSave, onUpdate, onProgress } = input;
  const steps = planMaterialSaveSteps(initialId, assets);
  const needsUpload = collectPendingMaterialUploads(assets).length > 0;
  const uploadOptions = { onProgress, steps, compressLevel };
  let pendingMaterialId = initialId ?? null;
  let lastCompressionSummaries: MaterialSaveProgress['compressionSummaries'];

  const finish = () => {
    emitSaveProgress(onProgress, steps, stepIndexForKind(steps, 'save'), {
      done: true,
      compressionSummaries: lastCompressionSummaries,
    });
    clearMaterialPendingSave();
  };

  const resolveCoverAttachmentId = async (materialId: string): Promise<string | null | undefined> => {
    if (!cover) return undefined;
    if (cover.remove) return null;
    if (cover.pendingFile) {
      const uploaded = await uploadLibraryMaterialFile(materialId, cover.pendingFile);
      return uploaded.id;
    }
    return cover.attachmentId ?? null;
  };

  const withCover = async (
    materialId: string,
    body: CreateLibraryMaterialRequestDto,
  ): Promise<CreateLibraryMaterialRequestDto> => {
    const coverAttachmentId = await resolveCoverAttachmentId(materialId);
    if (coverAttachmentId === undefined) return body;
    return { ...body, coverAttachmentId };
  };

  const markPending = (materialId: string) => {
    pendingMaterialId = materialId;
    markMaterialPendingSave({
      materialId,
      title: baseBody.title.trim() || 'Untitled material',
      startedAt: Date.now(),
    });
  };

  try {
    if (initialId) {
      if (needsUpload) {
        markPending(initialId);
        const uploadResult = await uploadPendingMaterialFiles(initialId, assets, uploadOptions);
        lastCompressionSummaries = uploadResult.compressionSummaries;
        emitSaveProgress(onProgress, steps, stepIndexForKind(steps, 'save'));
        await onUpdate(initialId, await withCover(initialId, {
          ...baseBody,
          assets: buildAssetPayload(uploadResult.drafts),
        }));
        finish();
        return;
      }

      emitSaveProgress(onProgress, steps, stepIndexForKind(steps, 'save'));
      await onUpdate(initialId, await withCover(initialId, { ...baseBody, assets: buildAssetPayload(assets) }));
      finish();
      return;
    }

    if (!needsUpload) {
      emitSaveProgress(onProgress, steps, stepIndexForKind(steps, 'save'));
      const created = await onSave({ ...baseBody, assets: buildAssetPayload(assets) });
      const needsCover = Boolean(cover?.pendingFile || cover?.remove);
      if (needsCover) {
        await onUpdate(
          created.id,
          await withCover(created.id, {
            ...baseBody,
            assets: buildAssetPayload(assets),
          }),
        );
      }
      finish();
      return;
    }

    emitSaveProgress(onProgress, steps, stepIndexForKind(steps, 'create'));
    const created = await onSave(baseBody);
    markPending(created.id);
    const uploadResult = await uploadPendingMaterialFiles(created.id, assets, uploadOptions);
    lastCompressionSummaries = uploadResult.compressionSummaries;
    emitSaveProgress(onProgress, steps, stepIndexForKind(steps, 'save'));
    await onUpdate(created.id, await withCover(created.id, {
      ...baseBody,
      assets: buildAssetPayload(uploadResult.drafts),
    }));
    finish();
  } catch (error) {
    if (pendingMaterialId) {
      markPending(pendingMaterialId);
    }
    throw error;
  }
}

export {
  planMaterialSaveSteps,
  type MaterialSaveProgress,
  type MaterialSaveProgressReporter,
} from './material-save-progress';

export type { MaterialAssetFileEntry, PendingMaterialUpload } from './material-asset-presets';
export { collectPendingMaterialUploads } from './material-asset-presets';
