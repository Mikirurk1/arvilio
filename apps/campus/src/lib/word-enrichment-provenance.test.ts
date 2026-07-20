import { resolveWordEnrichmentProvenance } from '@pkg/types';

describe('resolveWordEnrichmentProvenance', () => {
  it('reads stored enrichment metadata', () => {
    const payload = JSON.stringify({
      provider: 'reverso',
      enrichment: {
        dictionaryProvider: 'reverso',
        translationProviders: ['mymemory', 'gtx'],
      },
    });
    const result = resolveWordEnrichmentProvenance('combined:reverso+datamuse', payload);
    expect(result.dictionaryLabel).toBe('Reverso Context');
    expect(result.supplementalLabels).toEqual(['Datamuse (related words)']);
    expect(result.translationLabels).toEqual(['MyMemory', 'Google Translate (GTX)']);
    expect(result.translationUnknown).toBe(false);
  });

  it('falls back to source and provider for legacy words', () => {
    const payload = JSON.stringify({ provider: 'dictionary_api_dev' });
    const result = resolveWordEnrichmentProvenance('combined:dictionary_api_dev+datamuse', payload);
    expect(result.dictionaryLabel).toBe('Free Dictionary API');
    expect(result.translationUnknown).toBe(true);
  });
});
