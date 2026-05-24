import { stripHtml } from './strip-html';

describe('stripHtml', () => {
  it('strips tags and decodes entities', () => {
    expect(stripHtml('<p>Hello &amp; world</p>')).toBe('Hello & world');
  });

  it('returns empty for blank input', () => {
    expect(stripHtml('   ')).toBe('');
  });
});
