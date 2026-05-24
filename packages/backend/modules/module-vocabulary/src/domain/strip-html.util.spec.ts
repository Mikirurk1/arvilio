import { clipForTranslation, containsHtml, isUsablePlainText, stripHtml } from './strip-html.util';

describe('strip-html.util', () => {
  it('stripHtml removes tags and decodes entities', () => {
    expect(stripHtml('<p>Hello &amp; <b>world</b></p>')).toBe('Hello & world');
  });

  it('isUsablePlainText rejects placeholders', () => {
    expect(isUsablePlainText('—')).toBe(false);
    expect(isUsablePlainText('meaning')).toBe(true);
  });

  it('clipForTranslation shortens long text', () => {
    const long = 'word '.repeat(200);
    const clipped = clipForTranslation(long, 50);
    expect(clipped.length).toBeLessThanOrEqual(52);
    expect(clipped.endsWith('…')).toBe(true);
  });

  it('containsHtml detects markup', () => {
    expect(containsHtml('<span>x</span>')).toBe(true);
    expect(containsHtml('plain')).toBe(false);
  });
});
