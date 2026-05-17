import { BadRequestException } from '@nestjs/common';
import {
  CHAT_ALLOWED_EXTENSIONS,
  CHAT_ALLOWED_MIME_PREFIXES,
  CHAT_ATTACHMENT_MAX_BYTES,
} from './chat-attachment.constants';

export function assertChatFileAllowed(
  file: { originalname: string; mimetype: string; size: number },
): { safeName: string } {
  if (file.size > CHAT_ATTACHMENT_MAX_BYTES) {
    throw new BadRequestException('File is too large (max 5 MB)');
  }
  const lower = file.originalname.toLowerCase();
  const hasAllowedExt = CHAT_ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const hasAllowedMime = CHAT_ALLOWED_MIME_PREFIXES.some((prefix) =>
    file.mimetype.startsWith(prefix),
  );
  if (!hasAllowedExt && !hasAllowedMime) {
    throw new BadRequestException('File type is not allowed');
  }
  const safeName = file.originalname.replace(/[^\w.\-()\s]/g, '_').slice(0, 200);
  if (!safeName) throw new BadRequestException('Invalid file name');
  return { safeName };
}

export function messagePreview(body: string, fileName?: string | null): string {
  const trimmed = body.trim();
  if (trimmed) return trimmed;
  if (fileName) return `📎 ${fileName}`;
  return '';
}
