import { googleCloudTranslate } from './google-translate.client';

describe('googleCloudTranslate', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns null without api key', async () => {
    await expect(
      googleCloudTranslate('hello', 'en', 'uk', {
        apiUrl: 'https://translation.googleapis.com',
        apiKey: '',
      }),
    ).resolves.toBeNull();
  });

  it('returns translation on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { translations: [{ translatedText: 'привіт' }] } }),
    });
    await expect(
      googleCloudTranslate('hello', 'en', 'uk', {
        apiUrl: 'https://translation.googleapis.com',
        apiKey: 'key',
      }),
    ).resolves.toBe('привіт');
  });
});
