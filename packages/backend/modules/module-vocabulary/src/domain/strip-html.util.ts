/** Decode common HTML entities after tag removal. */
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
}

/** Plain text from Wiktionary / MediaWiki HTML fragments. */
export function stripHtml(html: string): string {
  if (!html?.trim()) return '';

  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '');

  text = decodeEntities(text);
  return text.replace(/\s+/g, ' ').trim();
}

export function isUsablePlainText(text: string | null | undefined): boolean {
  const t = text?.trim();
  return Boolean(t && t !== '—' && t !== '-');
}

/** MyMemory works best with shorter segments. */
export function clipForTranslation(text: string, maxLen = 480): string {
  const plain = stripHtml(text);
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 200 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

export function containsHtml(text: string | null | undefined): boolean {
  if (!text) return false;
  return /<[a-z][\s\S]*?>/i.test(text);
}
