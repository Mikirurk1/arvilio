import type { MaterialCompressorConfig } from './material-file-compressor';

export const MATERIAL_COMPRESS_LEVELS = ['off', 'light', 'balanced', 'strong'] as const;

export type MaterialCompressLevel = (typeof MATERIAL_COMPRESS_LEVELS)[number];

export type GhostscriptPdfProfile = '/screen' | '/ebook' | '/printer';

export function parseMaterialCompressLevel(raw: string | undefined | null): MaterialCompressLevel {
  const normalized = raw?.trim().toLowerCase();
  if (normalized && (MATERIAL_COMPRESS_LEVELS as readonly string[]).includes(normalized)) {
    return normalized as MaterialCompressLevel;
  }
  return 'balanced';
}

export function applyMaterialCompressLevel(
  base: MaterialCompressorConfig,
  level: MaterialCompressLevel,
): MaterialCompressorConfig {
  if (level === 'off') {
    return { ...base, enabled: false };
  }

  const tuned = compressLevelTuning(level);
  return {
    ...base,
    enabled: base.enabled,
    imageWebpQuality: tuned.imageWebpQuality,
    imageJpegQuality: tuned.imageJpegQuality,
    audioBitrate: tuned.audioBitrate,
    videoCrf: tuned.videoCrf,
    pdfImageDpi: tuned.pdfImageDpi,
    pdfSettings: tuned.pdfSettings,
  };
}

function compressLevelTuning(level: Exclude<MaterialCompressLevel, 'off'>): {
  pdfSettings: GhostscriptPdfProfile;
  pdfImageDpi: number;
  imageWebpQuality: number;
  imageJpegQuality: number;
  audioBitrate: string;
  videoCrf: number;
} {
  switch (level) {
    case 'light':
      return {
        pdfSettings: '/printer',
        pdfImageDpi: 200,
        imageWebpQuality: 90,
        imageJpegQuality: 92,
        audioBitrate: '160k',
        videoCrf: 22,
      };
    case 'strong':
      return {
        pdfSettings: '/screen',
        pdfImageDpi: 96,
        imageWebpQuality: 72,
        imageJpegQuality: 75,
        audioBitrate: '96k',
        videoCrf: 32,
      };
    case 'balanced':
    default:
      return {
        pdfSettings: '/ebook',
        pdfImageDpi: 150,
        imageWebpQuality: 82,
        imageJpegQuality: 85,
        audioBitrate: '128k',
        videoCrf: 28,
      };
  }
}

export function materialCompressLevelCodecSuffix(level: MaterialCompressLevel): string {
  return level === 'balanced' ? '' : `-${level}`;
}
