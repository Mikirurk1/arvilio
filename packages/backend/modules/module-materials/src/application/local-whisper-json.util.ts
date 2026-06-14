import type { SttSegment } from './webvtt.util';

type LocalWhisperJson = {
  language?: string;
  result?: { language?: string };
  segments?: Array<{ start?: number; end?: number; text?: string }>;
  transcription?: Array<{
    text?: string;
    offsets?: { from?: number; to?: number };
  }>;
};

export function segmentsFromLocalWhisperJson(payload: LocalWhisperJson): {
  language: string | null;
  segments: SttSegment[];
} {
  const language =
    payload.result?.language?.trim().toLowerCase() ??
    payload.language?.trim().toLowerCase() ??
    null;

  const fromTranscription = (payload.transcription ?? [])
    .map((item) => {
      const text = item.text?.trim() ?? '';
      if (!text) return null;
      const fromMs = item.offsets?.from ?? 0;
      const toMs = item.offsets?.to ?? fromMs + 1000;
      return {
        startSec: fromMs / 1000,
        endSec: Math.max(fromMs / 1000 + 0.05, toMs / 1000),
        text,
      };
    })
    .filter((item): item is SttSegment => item !== null);

  if (fromTranscription.length > 0) {
    return { language, segments: fromTranscription };
  }

  const fromSegments = (payload.segments ?? [])
    .map((item) => ({
      startSec: item.start ?? 0,
      endSec: item.end ?? (item.start ?? 0) + 1,
      text: item.text?.trim() ?? '',
    }))
    .filter((item) => item.text.length > 0);

  return { language, segments: fromSegments };
}
