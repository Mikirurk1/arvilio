import { Logger } from '@nestjs/common';
import type { WhisperVerboseResponse } from '../application/webvtt.util';

const logger = new Logger('WhisperSttClient');

export async function transcribeWithOpenAiWhisper(options: {
  apiKey: string;
  audioBuffer: Buffer;
  fileName: string;
  mimeType: string;
  language?: string | null;
}): Promise<WhisperVerboseResponse> {
  const form = new FormData();
  const blob = new Blob([Uint8Array.from(options.audioBuffer)], {
    type: options.mimeType || 'audio/mpeg',
  });
  form.append('file', blob, options.fileName);
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');
  if (options.language?.trim()) {
    form.append('language', options.language.trim().toLowerCase());
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    logger.warn(`Whisper API failed (${response.status}): ${detail.slice(0, 400)}`);
    throw new Error(`Whisper transcription failed (${response.status})`);
  }

  return (await response.json()) as WhisperVerboseResponse;
}
