import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { Logger } from '@nestjs/common';
import {
  applyMaterialCompressLevel,
  materialCompressLevelCodecSuffix,
  parseMaterialCompressLevel,
  type MaterialCompressLevel,
} from './material-compress-level';

const execFileAsync = promisify(execFile);
const logger = new Logger('MaterialFileCompressor');

export type MaterialMediaKind = 'image' | 'audio' | 'video' | 'pdf' | 'other';

export type MaterialCompressResult = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  originalSizeBytes: number;
  codec: string;
};

export type MaterialCompressorConfig = {
  enabled: boolean;
  imageEnabled: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  pdfEnabled: boolean;
  imageWebpQuality: number;
  imageJpegQuality: number;
  audioBitrate: string;
  videoCrf: number;
  pdfImageDpi: number;
  pdfSettings: '/screen' | '/ebook' | '/printer';
  ffmpegBin: string;
  ghostscriptBin: string;
  commandTimeoutMs: number;
};

export type MaterialCompressorTools = {
  ffmpegBin: string | null;
  ghostscriptBin: string | null;
};

export function readMaterialCompressorConfig(
  env: NodeJS.ProcessEnv = process.env,
): MaterialCompressorConfig {
  return {
    enabled: env['MATERIAL_COMPRESS_ENABLED'] !== 'false',
    imageEnabled: env['MATERIAL_COMPRESS_IMAGES'] !== 'false',
    audioEnabled: env['MATERIAL_COMPRESS_AUDIO'] !== 'false',
    videoEnabled: env['MATERIAL_COMPRESS_VIDEO'] !== 'false',
    pdfEnabled: env['MATERIAL_COMPRESS_PDF'] !== 'false',
    imageWebpQuality: clampInt(env['MATERIAL_IMAGE_WEBP_QUALITY'], 82, 40, 95),
    imageJpegQuality: clampInt(env['MATERIAL_IMAGE_JPEG_QUALITY'], 85, 40, 95),
    audioBitrate: env['MATERIAL_AUDIO_BITRATE']?.trim() || '128k',
    videoCrf: clampInt(env['MATERIAL_VIDEO_CRF'], 28, 18, 36),
    pdfImageDpi: clampInt(env['MATERIAL_PDF_IMAGE_DPI'], 150, 72, 300),
    pdfSettings: parsePdfSettings(env['MATERIAL_PDF_SETTINGS']),
    ffmpegBin: env['MATERIAL_FFMPEG_BIN']?.trim() || 'ffmpeg',
    ghostscriptBin: env['MATERIAL_GHOSTSCRIPT_BIN']?.trim() || 'gs',
    commandTimeoutMs: clampInt(env['MATERIAL_COMPRESS_TIMEOUT_MS'], 300_000, 5_000, 600_000),
  };
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parsePdfSettings(raw: string | undefined): '/screen' | '/ebook' | '/printer' {
  const value = raw?.trim().toLowerCase();
  if (value === '/screen' || value === 'screen') return '/screen';
  if (value === '/printer' || value === 'printer') return '/printer';
  return '/ebook';
}

export function resolveMaterialMediaKind(mimeType: string, originalName: string): MaterialMediaKind {
  const lower = originalName.toLowerCase();
  const mime = mimeType.toLowerCase();
  if (mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(lower)) {
    return 'image';
  }
  if (mime.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(lower)) {
    return 'audio';
  }
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(lower)) {
    return 'video';
  }
  if (mime === 'application/pdf' || lower.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'other';
}

function unchanged(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  codec = 'none',
): MaterialCompressResult {
  return {
    buffer,
    mimeType,
    extension: path.extname(originalName).toLowerCase() || '',
    sizeBytes: buffer.length,
    originalSizeBytes: buffer.length,
    codec,
  };
}

function preferSmaller(
  original: MaterialCompressResult,
  candidate: MaterialCompressResult,
): MaterialCompressResult {
  if (candidate.sizeBytes >= original.sizeBytes) {
    return original;
  }
  return candidate;
}

async function commandExists(bin: string): Promise<boolean> {
  try {
    await execFileAsync(bin, ['-version'], { timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

async function resolveBinary(preferred: string, fallbacks: readonly string[]): Promise<string | null> {
  for (const candidate of [...new Set([preferred, ...fallbacks])]) {
    if (!candidate) continue;
    if (await commandExists(candidate)) return candidate;
  }
  return null;
}

export async function resolveMaterialCompressorTools(
  config: MaterialCompressorConfig,
): Promise<MaterialCompressorTools> {
  return {
    ffmpegBin: await resolveBinary(config.ffmpegBin, [
      'ffmpeg',
      '/opt/homebrew/bin/ffmpeg',
      '/usr/local/bin/ffmpeg',
    ]),
    ghostscriptBin: await resolveBinary(config.ghostscriptBin, [
      'gs',
      '/opt/homebrew/bin/gs',
      '/usr/local/bin/gs',
    ]),
  };
}

function buildGhostscriptPdfArgs(
  inputPath: string,
  outputPath: string,
  config: MaterialCompressorConfig,
): string[] {
  return [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-dPDFSETTINGS=' + config.pdfSettings,
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    '-dSubsetFonts=true',
    '-dDownsampleColorImages=true',
    `-dColorImageResolution=${config.pdfImageDpi}`,
    '-dDownsampleGrayImages=true',
    `-dGrayImageResolution=${config.pdfImageDpi}`,
    '-dDownsampleMonoImages=true',
    '-dMonoImageResolution=300',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];
}

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arvilio-material-'));
  try {
    return await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function compressImage(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  config: MaterialCompressorConfig,
): Promise<MaterialCompressResult> {
  const original = unchanged(buffer, mimeType, originalName);
  const lower = originalName.toLowerCase();
  if (lower.endsWith('.svg') || mimeType === 'image/svg+xml') {
    return original;
  }

  let sharp: typeof import('sharp');
  try {
    sharp = (await import('sharp')).default;
  } catch {
    logger.warn('sharp is not installed; skipping image compression');
    return original;
  }

  try {
    const image = sharp(buffer, { failOn: 'none' });
    const meta = await image.metadata();
    if (meta.pages && meta.pages > 1) {
      return original;
    }

    const hasAlpha = meta.hasAlpha === true;
    if (hasAlpha) {
      const webp = await image.webp({ quality: config.imageWebpQuality, effort: 4 }).toBuffer();
      return preferSmaller(original, {
        buffer: webp,
        mimeType: 'image/webp',
        extension: '.webp',
        sizeBytes: webp.length,
        originalSizeBytes: buffer.length,
        codec: 'sharp-webp',
      });
    }

    const webp = await image.webp({ quality: config.imageWebpQuality, effort: 4 }).toBuffer();
    const webpResult: MaterialCompressResult = {
      buffer: webp,
      mimeType: 'image/webp',
      extension: '.webp',
      sizeBytes: webp.length,
      originalSizeBytes: buffer.length,
      codec: 'sharp-webp',
    };
    if (webpResult.sizeBytes < original.sizeBytes) {
      return webpResult;
    }

    const jpeg = await image
      .jpeg({ quality: config.imageJpegQuality, mozjpeg: true })
      .toBuffer();
    return preferSmaller(original, {
      buffer: jpeg,
      mimeType: 'image/jpeg',
      extension: '.jpg',
      sizeBytes: jpeg.length,
      originalSizeBytes: buffer.length,
      codec: 'sharp-jpeg',
    });
  } catch (error) {
    logger.warn(`Image compression failed for ${originalName}: ${String(error)}`);
    return original;
  }
}

async function compressWithFfmpeg(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  kind: 'audio' | 'video',
  config: MaterialCompressorConfig,
  ffmpegBin: string | null,
): Promise<MaterialCompressResult> {
  const original = unchanged(buffer, mimeType, originalName);
  if (!ffmpegBin) {
    return original;
  }

  const inputExt = path.extname(originalName) || (kind === 'audio' ? '.wav' : '.mp4');
  const outputExt = kind === 'audio' ? '.mp3' : '.mp4';
  const outputMime = kind === 'audio' ? 'audio/mpeg' : 'video/mp4';

  return withTempDir(async (dir) => {
    const inputPath = path.join(dir, `input${inputExt}`);
    const outputPath = path.join(dir, `output${outputExt}`);
    await fs.writeFile(inputPath, buffer);

    const args =
      kind === 'audio'
        ? [
            '-hide_banner',
            '-loglevel',
            'error',
            '-y',
            '-i',
            inputPath,
            '-vn',
            '-codec:a',
            'libmp3lame',
            '-b:a',
            config.audioBitrate,
            outputPath,
          ]
        : [
            '-hide_banner',
            '-loglevel',
            'error',
            '-y',
            '-i',
            inputPath,
            '-codec:v',
            'libx264',
            '-preset',
            'medium',
            '-crf',
            String(config.videoCrf),
            '-codec:a',
            'aac',
            '-b:a',
            config.audioBitrate,
            '-movflags',
            '+faststart',
            outputPath,
          ];

    try {
      await execFileAsync(ffmpegBin, args, {
        timeout: config.commandTimeoutMs,
        maxBuffer: 16 * 1024 * 1024,
      });
      const out = await fs.readFile(outputPath);
      return preferSmaller(original, {
        buffer: out,
        mimeType: outputMime,
        extension: outputExt,
        sizeBytes: out.length,
        originalSizeBytes: buffer.length,
        codec: kind === 'audio' ? 'ffmpeg-mp3' : 'ffmpeg-h264',
      });
    } catch (error) {
      logger.warn(`ffmpeg compression failed for ${originalName}: ${String(error)}`);
      return original;
    }
  });
}

async function compressPdf(
  buffer: Buffer,
  originalName: string,
  config: MaterialCompressorConfig,
  ghostscriptBin: string | null,
): Promise<MaterialCompressResult> {
  const original = unchanged(buffer, 'application/pdf', originalName);
  if (!ghostscriptBin) {
    return original;
  }

  return withTempDir(async (dir) => {
    const inputPath = path.join(dir, 'input.pdf');
    const outputPath = path.join(dir, 'output.pdf');
    await fs.writeFile(inputPath, buffer);

    try {
      await execFileAsync(
        ghostscriptBin,
        buildGhostscriptPdfArgs(inputPath, outputPath, config),
        { timeout: config.commandTimeoutMs, maxBuffer: 16 * 1024 * 1024 },
      );
      const out = await fs.readFile(outputPath);
      const candidate: MaterialCompressResult = {
        buffer: out,
        mimeType: 'application/pdf',
        extension: '.pdf',
        sizeBytes: out.length,
        originalSizeBytes: buffer.length,
        codec: 'ghostscript-pdf',
      };
      if (candidate.sizeBytes >= original.sizeBytes) {
        logger.log(
          `PDF compression did not reduce size for ${originalName}: ${original.sizeBytes} → ${candidate.sizeBytes} bytes`,
        );
        return original;
      }
      logger.log(
        `PDF compressed ${originalName}: ${original.sizeBytes} → ${candidate.sizeBytes} bytes`,
      );
      return candidate;
    } catch (error) {
      logger.warn(`PDF compression failed for ${originalName}: ${String(error)}`);
      return original;
    }
  });
}

export async function compressMaterialFile(
  file: { buffer: Buffer; mimeType: string; originalName: string },
  config: MaterialCompressorConfig,
  tools?: MaterialCompressorTools,
  compressLevel?: MaterialCompressLevel,
): Promise<MaterialCompressResult> {
  const level = parseMaterialCompressLevel(compressLevel ?? 'balanced');
  const effectiveConfig = applyMaterialCompressLevel(config, level);
  const codecSuffix = materialCompressLevelCodecSuffix(level);

  const original = unchanged(file.buffer, file.mimeType, file.originalName);
  if (!effectiveConfig.enabled) {
    return original;
  }

  const resolvedTools = tools ?? (await resolveMaterialCompressorTools(effectiveConfig));

  const appendSuffix = (result: MaterialCompressResult): MaterialCompressResult =>
    result.codec === 'none' || !codecSuffix
      ? result
      : { ...result, codec: `${result.codec}${codecSuffix}` };

  switch (resolveMaterialMediaKind(file.mimeType, file.originalName)) {
    case 'image':
      return appendSuffix(
        effectiveConfig.imageEnabled
          ? await compressImage(file.buffer, file.mimeType, file.originalName, effectiveConfig)
          : original,
      );
    case 'audio':
      return appendSuffix(
        effectiveConfig.audioEnabled
          ? await compressWithFfmpeg(
              file.buffer,
              file.originalName,
              file.mimeType,
              'audio',
              effectiveConfig,
              resolvedTools.ffmpegBin,
            )
          : original,
      );
    case 'video':
      return appendSuffix(
        effectiveConfig.videoEnabled
          ? await compressWithFfmpeg(
              file.buffer,
              file.originalName,
              file.mimeType,
              'video',
              effectiveConfig,
              resolvedTools.ffmpegBin,
            )
          : original,
      );
    case 'pdf':
      return appendSuffix(
        effectiveConfig.pdfEnabled
          ? await compressPdf(file.buffer, file.originalName, effectiveConfig, resolvedTools.ghostscriptBin)
          : original,
      );
    default:
      return original;
  }
}
