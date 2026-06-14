import {
  addTag,
  collectUniqueTags,
  filterTagSuggestions,
  isDuplicateTag,
  normalizeTag,
  parseTagsFromText,
  removeTag,
} from './tag-list';

describe('tag-list', () => {
  it('normalizeTag trims and collapses spaces', () => {
    expect(normalizeTag('  business   english  ')).toBe('business english');
  });

  it('parseTagsFromText splits on comma and dedupes case-insensitively', () => {
    expect(parseTagsFromText('Grammar, business, GRAMMAR')).toEqual(['Grammar', 'business']);
  });

  it('addTag and removeTag preserve other entries', () => {
    expect(addTag(['a'], 'B')).toEqual(['a', 'B']);
    expect(addTag(['a'], 'a')).toEqual(['a']);
    expect(removeTag(['Grammar', 'teens'], 'grammar')).toEqual(['teens']);
  });

  it('isDuplicateTag is case-insensitive', () => {
    expect(isDuplicateTag('Business', ['business'])).toBe(true);
  });

  it('collectUniqueTags merges and sorts', () => {
    expect(collectUniqueTags([['zebra', 'alpha'], ['Alpha', 'beta']])).toEqual([
      'alpha',
      'beta',
      'zebra',
    ]);
  });

  it('filterTagSuggestions hides selected and matches draft', () => {
    const suggestions = ['grammar', 'business', 'teens'];
    expect(filterTagSuggestions(suggestions, ['grammar'], 'bus')).toEqual(['business']);
  });
});
