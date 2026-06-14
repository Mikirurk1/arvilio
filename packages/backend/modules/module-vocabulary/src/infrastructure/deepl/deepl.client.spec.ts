import { deeplTranslate } from './deepl.client';

describe('deeplTranslate', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns null without auth key', async () => {
    await expect(
      deeplTranslate('hello', 'en', 'uk', { apiUrl: 'https://api-free.deepl.com', authKey: '' }),
    ).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns translation on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ translations: [{ text: 'привіт' }] }),
    });
    await expect(
      deeplTranslate('hello', 'en', 'uk', {
        apiUrl: 'https://api-free.deepl.com',
        authKey: 'test-key',
      }),
    ).resolves.toBe('привіт');
  });
});
