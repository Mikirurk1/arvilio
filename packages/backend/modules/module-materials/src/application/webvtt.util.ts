export type SttSegment = {
  startSec: number;
  endSec: number;
  text: string;
};

export type WhisperVerboseResponse = {
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  text?: string;
};

export function segmentsFromWhisperResponse(payload: WhisperVerboseResponse): {
  language: string | null;
  segments: SttSegment[];
} {
  const segments = (payload.segments ?? [])
    .map((item) => ({
      startSec: item.start,
      endSec: item.end,
      text: item.text.trim(),
    }))
    .filter((item) => item.text.length > 0);

  if (segments.length === 0 && payload.text?.trim()) {
    segments.push({ startSec: 0, endSec: 1, text: payload.text.trim() });
  }

  return {
    language: payload.language?.trim().toLowerCase() ?? null,
    segments,
  };
}

export function buildWebVtt(segments: SttSegment[]): string {
  const lines = ['WEBVTT', ''];
  segments.forEach((segment, index) => {
    lines.push(String(index + 1));
    lines.push(`${formatVttTime(segment.startSec)} --> ${formatVttTime(segment.endSec)}`);
    lines.push(segment.text);
    lines.push('');
  });
  return lines.join('\n');
}

function formatVttTime(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export function captionLanguageLabel(language: string): string {
  try {
    const display = new Intl.DisplayNames(['en'], { type: 'language' });
    return display.of(language) ?? language;
  } catch {
    return language;
  }
}
