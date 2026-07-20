import type { ChatMessageDto } from '@pkg/types';
import { API_BASE } from './api';

/** Build browser URL for a chat attachment DTO path (handles legacy `/api/...` values). */
export function chatAttachmentHref(url: string): string {
  if (!url) return url;
  if (url.startsWith('/api/')) return url;
  return `${API_BASE}${url}`;
}

export async function uploadChatAttachment(
  conversationId: string,
  file: File,
  body?: string,
): Promise<ChatMessageDto> {
  const form = new FormData();
  form.append('file', file);
  if (body?.trim()) form.append('body', body.trim());

  const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/attachments`, {
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

  return (await response.json()) as ChatMessageDto;
}

export function chatMessagePreview(message: Pick<ChatMessageDto, 'body' | 'attachment'>): string {
  const trimmed = message.body.trim();
  if (trimmed) return trimmed;
  if (message.attachment?.fileName) return `📎 ${message.attachment.fileName}`;
  return '';
}
