import { Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { segmentsFromLocalWhisperJson } from '../application/local-whisper-json.util';
import type { WhisperVerboseResponse } from '../application/webvtt.util';

const execFileAsync = promisify(execFile);
const logger = new Logger('LocalWhisperSttClient');

export async function transcribeWithLocalWhisper(options: {
  whisperBin: string;
  modelPath: string;
  ffmpegBin: string;
  audioBuffer: Buffer;
  fileName: string;
  mimeType: string;
  language?: string | null;
  timeoutMs: number;
}): Promise<WhisperVerboseResponse> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arvilio-whisper-'));
  const safeName = options.fileName.replace(/[^\w.\-()\s]/g, '_') || 'audio.bin';
  const inputPath = path.join(tempDir, safeName);
  const wavPath = path.join(tempDir, 'audio.wav');
  const outputPrefix = path.join(tempDir, 'transcript');

  try {
    await fs.writeFile(inputPath, options.audioBuffer);

    if (options.mimeType.includes('wav') && safeName.toLowerCase().endsWith('.wav')) {
      await fs.copyFile(inputPath, wavPath);
    } else {
      await execFileAsync(
        options.ffmpegBin,
        ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wavPath],
        { timeout: options.timeoutMs, maxBuffer: 16 * 1024 * 1024 },
      );
    }

    const args = [
      '-m',
      options.modelPath,
      '-f',
      wavPath,
      '-oj',
      '-of',
      outputPrefix,
      '-np',
    ];
    if (options.language?.trim()) {
      args.push('-l', options.language.trim().toLowerCase());
    }

    await execFileAsync(options.whisperBin, args, {
      timeout: options.timeoutMs,
      maxBuffer: 16 * 1024 * 1024,
    });

    const jsonPath = `${outputPrefix}.json`;
    const raw = await fs.readFile(jsonPath, 'utf8');
    const parsed = JSON.parse(raw) as Parameters<typeof segmentsFromLocalWhisperJson>[0];
    const { language, segments } = segmentsFromLocalWhisperJson(parsed);

    return {
      language: language ?? undefined,
      segments: segments.map((segment) => ({
        start: segment.startSec,
        end: segment.endSec,
        text: segment.text,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Local Whisper failed: ${message.slice(0, 400)}`);
    throw new Error(
      'Local Whisper transcription failed. Install whisper.cpp (`brew install whisper-cpp`), download a ggml model, and set MATERIAL_WHISPER_MODEL.',
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
