import { reversoTranslate } from './reverso.client';

describe('reversoTranslate', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('returns primary translation from Reverso JSON', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          translation: ['привіт'],
          languageDetection: { detectedLanguage: 'eng' },
        }),
    });

    const result = await reversoTranslate('hello', 'en', 'uk', {
      apiUrl: 'https://api.reverso.net/translate/v1/translation',
    });

    expect(result?.translation).toBe('привіт');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.reverso.net/translate/v1/translation',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns null for unsupported language pair', async () => {
    const result = await reversoTranslate('hello', 'en', 'xx', {
      apiUrl: 'https://api.reverso.net/translate/v1/translation',
    });
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null when Cloudflare challenge HTML is returned', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '<html><title>Just a moment...</title></html>',
    });

    const result = await reversoTranslate('hello', 'en', 'uk', {
      apiUrl: 'https://api.reverso.net/translate/v1/translation',
    });

    expect(result).toBeNull();
  });
});
