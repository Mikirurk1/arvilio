export type LegalTemplateVars = {
  schoolName: string;
  legalName: string;
  legalAddress: string;
  legalCountry: string;
  supportEmail: string;
  supportPhone: string;
  mcc: string;
};

export function applyLegalTemplate(template: string, vars: LegalTemplateVars): string {
  const supportPhoneLine = vars.supportPhone ? ` / ${vars.supportPhone}` : '';
  return template
    .replaceAll('{{schoolName}}', vars.schoolName || 'the school')
    .replaceAll('{{legalName}}', vars.legalName || vars.schoolName || 'the Seller')
    .replaceAll('{{legalAddress}}', vars.legalAddress || 'Address on file with the school')
    .replaceAll('{{legalCountry}}', vars.legalCountry || 'UA')
    .replaceAll('{{supportEmail}}', vars.supportEmail || 'support (see Contacts)')
    .replaceAll('{{supportPhone}}', vars.supportPhone || '—')
    .replaceAll('{{supportPhoneLine}}', supportPhoneLine)
    .replaceAll('{{mcc}}', vars.mcc || '8299');
}

/** Minimal markdown → HTML for legal pages (headings, lists, paragraphs, links, bold). */
export function legalMarkdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  const inline = (text: string) => {
    const escaped = escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
      if (/^(\/|https?:\/\/)/.test(href)) {
        return `<a href="${href}">${label}</a>`;
      }
      return label;
    });
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    flushList();
    html.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  return html.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
