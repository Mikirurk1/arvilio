import { Test } from '@nestjs/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
    delete process.env['LIBRETRANSLATE_URL'];
    process.env['TRANSLATION_GTX_FALLBACK'] = 'false';
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

  it('uses MyMemory when response is valid', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        responseStatus: 200,
        responseData: { translatedText: 'привіт' },
      }),
    });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
  });

  it('skips MyMemory quota warning text', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        responseStatus: 200,
        responseData: { translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS' },
      }),
    });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBeNull();
  });

  it('returns null when MyMemory responseStatus is not 200', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ responseStatus: 429, responseData: { translatedText: 'x' } }),
    });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBeNull();
  });

  it('falls back to LibreTranslate when MyMemory fails', async () => {
    process.env['LIBRETRANSLATE_URL'] = 'https://libre.test';
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'привіт' }),
      });
    const moduleRef = await Test.createTestingModule({ providers: [TranslationService] }).compile();
    const libreService = moduleRef.get(TranslationService);
    await expect(libreService.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
  });

  it('uses GTX fallback when earlier providers fail', async () => {
    process.env['TRANSLATION_GTX_FALLBACK'] = 'true';
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[['привіт', 'hello', null, null, 10]]],
      });
    const moduleRef = await Test.createTestingModule({ providers: [TranslationService] }).compile();
    const gtxService = moduleRef.get(TranslationService);
    await expect(gtxService.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
  });

  it('MyMemory network error returns null', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'));
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBeNull();
  });

  it('MyMemory empty translated text returns null', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        responseStatus: 200,
        responseData: { translatedText: '   ' },
      }),
    });
    await expect(service.translate('hello', 'en', 'uk')).resolves.toBeNull();
  });

  it('LibreTranslate uses api key when configured', async () => {
    process.env['LIBRETRANSLATE_URL'] = 'https://libre.test/';
    process.env['LIBRETRANSLATE_API_KEY'] = 'secret';
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'привіт' }),
      });
    const moduleRef = await Test.createTestingModule({ providers: [TranslationService] }).compile();
    const libreService = moduleRef.get(TranslationService);
    await expect(libreService.translate('hello', 'en', 'uk')).resolves.toBe('привіт');
    const libreCall = fetchMock.mock.calls[1];
    expect(JSON.parse(String(libreCall?.[1]?.body))).toMatchObject({ api_key: 'secret' });
  });

  it('GTX invalid payload returns null', async () => {
    process.env['TRANSLATION_GTX_FALLBACK'] = 'true';
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ not: 'array' }) });
    const moduleRef = await Test.createTestingModule({ providers: [TranslationService] }).compile();
    const gtxService = moduleRef.get(TranslationService);
    await expect(gtxService.translate('hello', 'en', 'uk')).resolves.toBeNull();
  });
});
