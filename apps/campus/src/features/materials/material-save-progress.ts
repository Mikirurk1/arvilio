import type { MaterialAssetDraft } from './material-asset-presets';
import { collectPendingMaterialUploads } from './material-asset-presets';

export type MaterialSaveStepKind = 'create' | 'upload' | 'compress' | 'save';

export type MaterialSaveStep = {
  kind: MaterialSaveStepKind;
  label: string;
  fileName?: string;
};

export type MaterialCompressionSummary = {
  fileName: string;
  sizeBytes: number;
  originalSizeBytes: number;
  compressionCodec: string;
};

export type MaterialSaveProgress = {
  stepIndex: number;
  stepCount: number;
  stepLabel: string;
  overallPercent: number;
  uploadBytesLoaded?: number;
  uploadBytesTotal?: number;
  uploadFileName?: string;
  /** Client finished sending bytes; server compresses (sharp / ffmpeg / gs) before response. */
  stepPhase?: 'uploading' | 'compressing';
  compressionSummaries?: MaterialCompressionSummary[];
  done?: boolean;
};

export type MaterialSaveProgressReporter = (progress: MaterialSaveProgress) => void;

/** Matches server-side compression in MaterialFileCompressorService. */
export function isCompressibleMaterialFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (mime === 'image/svg+xml' || name.endsWith('.svg')) return false;
  if (mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name)) return true;
  if (mime.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(name)) return true;
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(name)) return true;
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return true;
  return false;
}

export function planMaterialSaveSteps(
  initialId: string | null | undefined,
  assets: MaterialAssetDraft[],
): MaterialSaveStep[] {
  const pendingUploads = collectPendingMaterialUploads(assets);
  const steps: MaterialSaveStep[] = [];

  if (!initialId && pendingUploads.length > 0) {
    steps.push({ kind: 'create', label: 'Creating material entry…' });
  }

  for (const upload of pendingUploads) {
    const name = upload.file.name;
    steps.push({ kind: 'upload', label: `Uploading ${name}`, fileName: name });
    if (isCompressibleMaterialFile(upload.file)) {
      steps.push({
        kind: 'compress',
        label: `Compressing ${name}`,
        fileName: name,
      });
    }
  }

  if (initialId) {
    steps.push({ kind: 'save', label: 'Saving changes…' });
  } else if (pendingUploads.length > 0) {
    steps.push({ kind: 'save', label: 'Linking uploaded files…' });
  } else {
    steps.push({ kind: 'save', label: 'Creating material…' });
  }

  return steps;
}

export function computeOverallPercent(
  stepIndex: number,
  stepCount: number,
  fileProgress = 0,
  stepKind?: MaterialSaveStepKind,
): number {
  if (stepCount <= 0) return 0;
  const clampedIndex = Math.max(1, Math.min(stepIndex, stepCount));
  let intra = 0.35;
  if (stepKind === 'upload') intra = fileProgress;
  if (stepKind === 'compress') intra = 0.72;
  const raw = ((clampedIndex - 1 + intra) / stepCount) * 100;
  return Math.max(0, Math.min(99, Math.round(raw)));
}

export function stepIndexForKind(
  steps: MaterialSaveStep[],
  kind: MaterialSaveStepKind,
  occurrence = 0,
): number {
  let seen = 0;
  for (let index = 0; index < steps.length; index += 1) {
    if (steps[index]?.kind === kind) {
      if (seen === occurrence) return index + 1;
      seen += 1;
    }
  }
  return steps.length;
}

export function uploadStepIndices(steps: MaterialSaveStep[]): number[] {
  return steps.reduce<number[]>((acc, step, index) => {
    if (step.kind === 'upload') acc.push(index + 1);
    return acc;
  }, []);
}

export type MaterialFileUploadPhase = {
  uploadStepIndex: number;
  compressStepIndex: number | null;
};

/** Pairs each upload step with the following compress step when present. */
export function fileUploadPhases(steps: MaterialSaveStep[]): MaterialFileUploadPhase[] {
  const phases: MaterialFileUploadPhase[] = [];
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    if (step?.kind !== 'upload') continue;
    const next = steps[index + 1];
    phases.push({
      uploadStepIndex: index + 1,
      compressStepIndex: next?.kind === 'compress' ? index + 2 : null,
    });
  }
  return phases;
}

export function emitSaveProgress(
  reporter: MaterialSaveProgressReporter | undefined,
  steps: MaterialSaveStep[],
  stepIndex: number,
  partial?: {
    fileProgress?: number;
    uploadBytesLoaded?: number;
    uploadBytesTotal?: number;
    stepPhase?: MaterialSaveProgress['stepPhase'];
    compressionSummaries?: MaterialCompressionSummary[];
    done?: boolean;
  },
): void {
  if (!reporter) return;
  const step = steps[stepIndex - 1];
  const stepCount = steps.length;
  const overallPercent = partial?.done
    ? 100
    : computeOverallPercent(
        stepIndex,
        stepCount,
        partial?.fileProgress ?? 0,
        step?.kind,
      );

  reporter({
    stepIndex,
    stepCount,
    stepLabel: step?.label ?? 'Saving…',
    overallPercent,
    uploadBytesLoaded: partial?.uploadBytesLoaded,
    uploadBytesTotal: partial?.uploadBytesTotal,
    uploadFileName: step?.fileName,
    stepPhase: partial?.stepPhase,
    compressionSummaries: partial?.compressionSummaries,
    done: partial?.done,
  });
}
