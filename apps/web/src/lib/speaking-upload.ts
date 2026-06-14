import { API_BASE } from './api';

export function speakingSubmissionAudioHref(submissionId: string): string {
  return `${API_BASE}/speaking/submissions/${submissionId}/audio`;
}

export async function uploadSpeakingSubmissionAudio(
  submissionId: string,
  blob: Blob,
  fileName = 'recording.webm',
): Promise<{ ok: true; audioUrl: string }> {
  const form = new FormData();
  form.append('file', blob, fileName);

  const response = await fetch(`${API_BASE}/speaking/submissions/${submissionId}/audio`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  if (!response.ok) {
    let message = `Upload failed: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: string | string[] };
          if (parsed.message) {
            message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
          }
        } catch {
          message = text;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await response.json()) as { ok: true; audioUrl: string };
}
