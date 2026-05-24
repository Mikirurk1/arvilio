export const CHAT_ATTACHMENT_TTL_MS = 24 * 60 * 60 * 1000;
export const CHAT_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

export const CHAT_ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'text/',
  'application/vnd',
  'application/msword',
] as const;

export const CHAT_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
  '.svg',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
] as const;
