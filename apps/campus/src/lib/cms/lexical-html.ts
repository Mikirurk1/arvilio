/**
 * Minimal Lexical JSON helpers for Campus CMS page bodies.
 * Seed stores markdown as a single paragraph text node (or structured nodes).
 */

type LexicalTextNode = { type?: string; text?: string; children?: LexicalTextNode[] };
type LexicalElement = {
  type?: string;
  tag?: string;
  listType?: string;
  children?: LexicalTextNode[];
};

function collectText(nodes: LexicalTextNode[] | undefined): string {
  if (!nodes?.length) return '';
  return nodes
    .map((n) => {
      if (typeof n.text === 'string') return n.text;
      if (n.children) return collectText(n.children);
      return '';
    })
    .join('');
}

/** Prefer raw markdown seeded as one paragraph; else flatten structured Lexical to markdown-ish text. */
export function lexicalToMarkdownSource(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const root = (value as { root?: { children?: LexicalElement[] } }).root;
  if (!root?.children?.length) return '';

  // Single paragraph containing full markdown document (seed path).
  if (root.children.length === 1 && root.children[0]?.type === 'paragraph') {
    return collectText(root.children[0].children).trim();
  }

  const lines: string[] = [];
  for (const node of root.children) {
    if (!node || typeof node !== 'object') continue;
    const text = collectText(node.children).trim();
    if (!text) continue;
    if (node.type === 'heading') {
      const level = node.tag === 'h1' ? '# ' : '## ';
      lines.push(`${level}${text}`);
    } else if (node.type === 'list') {
      for (const item of node.children ?? []) {
        const itemText = collectText(
          (item as LexicalElement).children as LexicalTextNode[],
        ).trim();
        if (itemText) lines.push(`- ${itemText}`);
      }
    } else {
      lines.push(text);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}
