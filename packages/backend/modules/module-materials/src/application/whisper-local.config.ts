import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';

export type LocalWhisperConfig = {
  whisperBin: string;
  modelPath: string;
  ffmpegBin: string;
  commandTimeoutMs: number;
};

export type LocalWhisperTools = {
  whisperBin: string | null;
  modelPath: string | null;
  ffmpegBin: string | null;
};

export function readLocalWhisperConfig(env: NodeJS.ProcessEnv = process.env): LocalWhisperConfig {
  return {
    whisperBin: env['MATERIAL_WHISPER_BIN']?.trim() || 'whisper-cli',
    modelPath: env['MATERIAL_WHISPER_MODEL']?.trim() || '',
    ffmpegBin: env['MATERIAL_FFMPEG_BIN']?.trim() || 'ffmpeg',
    commandTimeoutMs: clampInt(env['MATERIAL_WHISPER_TIMEOUT_MS'], 600_000, 30_000, 3_600_000),
  };
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

async function pathAccessible(filePath: string): Promise<boolean> {
  try {
    await access(filePath, fsConstants.X_OK);
    return true;
  } catch {
    try {
      await access(filePath, fsConstants.R_OK);
      return true;
    } catch {
      return false;
    }
  }
}

export async function resolveLocalWhisperTools(
  config: LocalWhisperConfig = readLocalWhisperConfig(),
): Promise<LocalWhisperTools> {
  const whisperBin = (await pathAccessible(config.whisperBin)) ? config.whisperBin : null;
  const modelPath =
    config.modelPath && (await pathAccessible(config.modelPath)) ? config.modelPath : null;
  const ffmpegBin = (await pathAccessible(config.ffmpegBin)) ? config.ffmpegBin : null;

  return { whisperBin, modelPath, ffmpegBin };
}

export function localWhisperConfigured(config: LocalWhisperConfig = readLocalWhisperConfig()): boolean {
  return Boolean(config.modelPath);
}
