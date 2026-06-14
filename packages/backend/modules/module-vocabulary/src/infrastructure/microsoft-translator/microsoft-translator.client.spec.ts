import { microsoftTranslate } from './microsoft-translator.client';

describe('microsoftTranslate', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns null without key or region', async () => {
    await expect(
      microsoftTranslate('hello', 'en', 'uk', {
        apiUrl: 'https://api.cognitive.microsofttranslator.com',
        subscriptionKey: '',
        region: 'eastus',
      }),
    ).resolves.toBeNull();
  });

  it('returns translation on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ translations: [{ text: 'привіт' }] }],
    });
    await expect(
      microsoftTranslate('hello', 'en', 'uk', {
        apiUrl: 'https://api.cognitive.microsofttranslator.com',
        subscriptionKey: 'key',
        region: 'eastus',
      }),
    ).resolves.toBe('привіт');
  });
});
