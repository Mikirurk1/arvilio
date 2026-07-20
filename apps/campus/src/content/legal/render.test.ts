import { applyLegalTemplate, legalMarkdownToHtml } from './render';

describe('legalMarkdownToHtml', () => {
  it('escapes raw HTML and renders headings/lists', () => {
    const html = legalMarkdownToHtml('# Title\n\n- item **bold**\n- <script>x</script>');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('only allows relative or http(s) links', () => {
    const html = legalMarkdownToHtml('[ok](/legal/terms) and [bad](javascript:alert(1))');
    expect(html).toContain('<a href="/legal/terms">ok</a>');
    expect(html).not.toContain('javascript:');
  });
});

describe('applyLegalTemplate', () => {
  it('substitutes seller placeholders', () => {
    const out = applyLegalTemplate('Hello {{legalName}} ({{mcc}})', {
      schoolName: 'School',
      legalName: 'Acme LLC',
      legalAddress: '1 St',
      legalCountry: 'UA',
      supportEmail: 'a@b.c',
      supportPhone: '',
      mcc: '8299',
    });
    expect(out).toBe('Hello Acme LLC (8299)');
  });
});
