import { dictionaryProviderOrder } from './dictionary-provider.util';

describe('dictionary-provider.util', () => {
  it('rotates provider order with primary first and wiktionary last when not primary', () => {
    expect(dictionaryProviderOrder('dictionary_api_dev')).toEqual([
      'dictionary_api_dev',
      'reverso',
      'wiktionary',
    ]);
    expect(dictionaryProviderOrder('reverso')).toEqual([
      'reverso',
      'dictionary_api_dev',
      'wiktionary',
    ]);
    expect(dictionaryProviderOrder('wiktionary')).toEqual([
      'wiktionary',
      'dictionary_api_dev',
      'reverso',
    ]);
  });
});
