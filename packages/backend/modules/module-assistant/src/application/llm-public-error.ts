/**
 * Sanitize LLM errors before they reach clients.
 * Chat (all users) must never see provider bodies or key material.
 * Admin Test may see status + redacted detail.
 */

const KEY_PATTERNS: RegExp[] = [
  /\bBearer\s+[A-Za-z0-9._\-+=/]+/gi,
  /\bsk-[A-Za-z0-9\-_]{8,}\b/g,
  /\bsk-ant-[A-Za-z0-9\-_]{8,}\b/g,
  /\bnvapi-[A-Za-z0-9\-_]{8,}\b/g,
  /\bxai-[A-Za-z0-9\-_]{8,}\b/g,
  /\bapi[_-]?key["']?\s*[:=]\s*["']?[^"'\s,}]+/gi,
  /\bauthorization["']?\s*[:=]\s*["']?[^"'\s,}]+/gi,
];

export function redactSecrets(text: string): string {
  let out = text;
  for (const pattern of KEY_PATTERNS) {
    out = out.replace(pattern, '[REDACTED]');
  }
  // Long opaque tokens (32+ url-safe chars) that look like keys — keep short ids.
  out = out.replace(/\b[A-Za-z0-9_\-]{40,}\b/g, '[REDACTED]');
  return out;
}

/** Safe copy for every Campus user in Arvi chat. */
export function publicChatLlmError(status?: number): string {
  if (status === 401 || status === 403) {
    return 'Assistant is misconfigured (authentication failed). Ask your school admin to check AI settings.';
  }
  if (status === 404) {
    return 'Assistant is misconfigured (model or endpoint not found). Ask your school admin to check AI settings.';
  }
  if (status === 429) {
    return 'Assistant is busy right now. Please try again in a moment.';
  }
  if (status && status >= 500) {
    return 'The AI provider is temporarily unavailable. Please try again later.';
  }
  return 'Assistant is temporarily unavailable. Please try again later.';
}

function extractProviderDetail(body: string): string {
  const trimmed = body.replace(/\s+/g, ' ').trim().slice(0, 400);
  try {
    const json = JSON.parse(body) as {
      error?: { message?: string; code?: string };
      detail?: string;
      title?: string;
      message?: string;
    };
    return (
      json.error?.message ||
      json.detail ||
      json.message ||
      (json.title ? `${json.title}${json.detail ? `: ${json.detail}` : ''}` : '') ||
      trimmed
    );
  } catch {
    return trimmed;
  }
}

/**
 * Admin-facing probe / settings Test — status + short redacted detail.
 * Never include Authorization headers or raw key material.
 */
export function publicAdminLlmError(status: number, body: string): string {
  const detail = redactSecrets(extractProviderDetail(body)).replace(/\s+/g, ' ').trim().slice(0, 180);
  if (status === 401 || status === 403) {
    return `Authentication failed (${status})${detail ? `: ${detail}` : ''}. Check the API key.`;
  }
  if (status === 404) {
    return `Endpoint/model not found (404)${detail ? `: ${detail}` : ''}. Check Base URL and Model.`;
  }
  if (status === 429) {
    return `Rate limited (429)${detail ? `: ${detail}` : ''}.`;
  }
  return `Provider error (${status})${detail ? `: ${detail}` : ''}`;
}

/** Parse `LLM provider error (404): …` thrown by providers for chat mapping. */
export function statusFromProviderErrorMessage(message: string): number | undefined {
  const m = message.match(/\((\d{3})\)/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}
