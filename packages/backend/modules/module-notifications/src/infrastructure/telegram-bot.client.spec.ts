import {
  deleteTelegramWebhook,
  escapeTelegramHtml,
  fetchTelegramUpdates,
  getTelegramBotToken,
  getTelegramWidgetConfig,
  isLocalWebOrigin,
  resolveTelegramBotUsername,
  sendTelegramBotMessage,
  shouldTelegramDevPolling,
} from './telegram-bot.client';

describe('telegram-bot.client', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_DEV_POLLING;
    delete process.env.TELEGRAM_BOT_USERNAME;
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('escapeTelegramHtml escapes special chars', () => {
    expect(escapeTelegramHtml('a & b <c>')).toBe('a &amp; b &lt;c&gt;');
  });

  it('getTelegramBotToken returns null when unset', () => {
    expect(getTelegramBotToken()).toBeNull();
  });

  it('getTelegramBotToken trims token', () => {
    process.env.TELEGRAM_BOT_TOKEN = '  token  ';
    expect(getTelegramBotToken()).toBe('token');
  });

  it('isLocalWebOrigin detects localhost', () => {
    process.env.WEB_ORIGIN = 'http://localhost:4200';
    expect(isLocalWebOrigin()).toBe(true);
    process.env.WEB_ORIGIN = 'https://app.example.com';
    expect(isLocalWebOrigin()).toBe(false);
  });

  it('shouldTelegramDevPolling respects env', () => {
    process.env.TELEGRAM_BOT_TOKEN = 't';
    process.env.TELEGRAM_DEV_POLLING = 'true';
    expect(shouldTelegramDevPolling()).toBe(true);
    process.env.TELEGRAM_DEV_POLLING = 'false';
    expect(shouldTelegramDevPolling()).toBe(false);
  });

  it('resolveTelegramBotUsername prefers env over getMe', async () => {
    process.env.TELEGRAM_BOT_USERNAME = '@jest_bot';
    await expect(resolveTelegramBotUsername()).resolves.toBe('jest_bot');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('resolveTelegramBotUsername calls getMe when env missing', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: { username: 'remote_bot' } }),
    });
    await expect(resolveTelegramBotUsername()).resolves.toBe('remote_bot');
  });

  it('getTelegramWidgetConfig marks localhost bot link flow', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    process.env.TELEGRAM_BOT_USERNAME = 'jest_bot';
    process.env.WEB_ORIGIN = 'http://localhost:4200';
    await expect(getTelegramWidgetConfig()).resolves.toEqual({
      available: true,
      botUsername: 'jest_bot',
      localhostWarning: true,
      botLinkFlow: true,
    });
  });

  it('fetchTelegramUpdates returns conflict on HTTP 409', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({ ok: false, status: 409, text: async () => 'conflict' });
    await expect(fetchTelegramUpdates(0)).resolves.toEqual({ updates: [], conflict: true });
  });

  it('deleteTelegramWebhook no-ops without token', async () => {
    await expect(deleteTelegramWebhook()).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sendTelegramBotMessage returns false without token', async () => {
    await expect(sendTelegramBotMessage('123', 'hello')).resolves.toBe(false);
  });

  it('sendTelegramBotMessage posts HTML message', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });
    await expect(
      sendTelegramBotMessage('123', 'Hello', { parseMode: 'HTML' }),
    ).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/sendMessage'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fetchTelegramUpdates returns parsed updates', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: [{ update_id: 1 }] }),
    });
    await expect(fetchTelegramUpdates(0)).resolves.toEqual({
      updates: [{ update_id: 1 }],
      conflict: false,
    });
  });

  it('sendTelegramBotMessage returns false on HTTP error', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    });
    await expect(sendTelegramBotMessage('123', 'Hello')).resolves.toBe(false);
  });

  it('sendTelegramBotMessage returns false on network error', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockRejectedValueOnce(new Error('network'));
    await expect(sendTelegramBotMessage('123', 'Hello')).resolves.toBe(false);
  });

  it('sendTelegramBotMessage returns false when API ok is false', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false }),
    });
    await expect(sendTelegramBotMessage('123', 'Hello')).resolves.toBe(false);
  });

  it('deleteTelegramWebhook calls API when token is set', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({ ok: true });
    await deleteTelegramWebhook();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/deleteWebhook'));
  });

  it('fetchTelegramUpdates returns empty without token', async () => {
    await expect(fetchTelegramUpdates(0)).resolves.toEqual({ updates: [], conflict: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetchTelegramUpdates handles non-409 HTTP errors', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'server error',
    });
    await expect(fetchTelegramUpdates(0)).resolves.toEqual({ updates: [], conflict: false });
  });

  it('fetchTelegramUpdates handles payload ok false', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false, description: 'invalid token' }),
    });
    await expect(fetchTelegramUpdates(0)).resolves.toEqual({ updates: [], conflict: false });
  });

  it('resolveTelegramBotUsername returns null when getMe fails', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(resolveTelegramBotUsername()).resolves.toBeNull();
  });

  it('getTelegramWidgetConfig for production origin', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    process.env.TELEGRAM_BOT_USERNAME = 'prod_bot';
    process.env.WEB_ORIGIN = 'https://app.example.com';
    await expect(getTelegramWidgetConfig()).resolves.toEqual({
      available: true,
      botUsername: 'prod_bot',
      localhostWarning: false,
      botLinkFlow: false,
    });
  });

  it('shouldTelegramDevPolling is false without token', () => {
    expect(shouldTelegramDevPolling()).toBe(false);
  });

  it('isLocalWebOrigin detects 127.0.0.1', () => {
    process.env.WEB_ORIGIN = 'http://127.0.0.1:4200';
    expect(isLocalWebOrigin()).toBe(true);
  });
});
