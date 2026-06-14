import { Test } from '@nestjs/testing';
import { resetPlatformIntegrationRuntimeFromEnv } from '@be/platform-integration';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
    delete process.env['LIBRETRANSLATE_URL'];
    delete process.env['REVERSO_ENABLED'];
    resetPlatformIntegrationRuntimeFromEnv();
    const moduleRef = await Test.createTestingModule({
      providers: [TranslationService],
    }).compile();
    service = moduleRef.get(TranslationService);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns null for empty text', async () => {
    await expect(service.translate('  ', 'en', 'uk')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns trimmed text when source equals target language', async () => {
    await expect(service.translate('  Hello ', 'EN', 'en')).resolves.toBe('Hello');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses MyMemory first when it is the active provider', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        responseStatus: 200,
        responseData: { translatedText: 'привіт' },
      }),
    });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('mymemory');
  });

  it('skips MyMemory quota warning and tries next provider', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseStatus: 200,
          responseData: {
            translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[['привіт', 'hello', null, null, 10]]],
      });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns null when MyMemory responseStatus is not 200 and chain exhausted', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseStatus: 429,
          responseData: { translatedText: 'x' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ not: 'array' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ translation: [] }),
      });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBeNull();
  });

  it('falls back to LibreTranslate when MyMemory fails', async () => {
    process.env['LIBRETRANSLATE_URL'] = 'https://libre.test';
    resetPlatformIntegrationRuntimeFromEnv();
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'привіт' }),
      });
    const moduleRef = await Test.createTestingModule({
      providers: [TranslationService],
    }).compile();
    const libreService = moduleRef.get(TranslationService);
    await expect(libreService.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
  });

  it('uses GTX when earlier providers fail', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[['привіт', 'hello', null, null, 10]]],
      });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('translate.googleapis.com');
  });

  it('MyMemory network error continues the chain', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[['привіт', 'hello', null, null, 10]]],
      });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
  });

  it('MyMemory empty translated text continues the chain', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseStatus: 200,
          responseData: { translatedText: '   ' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[['привіт', 'hello', null, null, 10]]],
      });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
  });

  it('LibreTranslate uses api key when configured', async () => {
    process.env['LIBRETRANSLATE_URL'] = 'https://libre.test/';
    process.env['LIBRETRANSLATE_API_KEY'] = 'secret';
    resetPlatformIntegrationRuntimeFromEnv();
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'привіт' }),
      });
    const moduleRef = await Test.createTestingModule({
      providers: [TranslationService],
    }).compile();
    const libreService = moduleRef.get(TranslationService);
    await expect(libreService.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
    const libreCall = fetchMock.mock.calls[1];
    expect(JSON.parse(String(libreCall?.[1]?.body))).toMatchObject({
      api_key: 'secret',
    });
  });

  it('GTX invalid payload returns null after chain exhausted', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ not: 'array' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ translation: [] }),
      });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBeNull();
  });

  it('uses Reverso first when it is the active provider', async () => {
    process.env['REVERSO_ENABLED'] = 'true';
    resetPlatformIntegrationRuntimeFromEnv();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ translation: ['привіт'] }),
    });
    const moduleRef = await Test.createTestingModule({
      providers: [TranslationService],
    }).compile();
    const reversoService = moduleRef.get(TranslationService);
    await expect(reversoService.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('api.reverso.net');
    delete process.env['REVERSO_ENABLED'];
    resetPlatformIntegrationRuntimeFromEnv();
  });
});
