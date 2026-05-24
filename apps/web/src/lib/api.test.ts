import { ApiError, apiClient, getApiData } from './api';

describe('api', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('apiClient.get returns parsed JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    }) as typeof fetch;

    await expect(apiClient.get<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('apiClient.post sends JSON body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    }) as typeof fetch;

    await apiClient.post('/items', { name: 'x' });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'x' }));
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('throws ApiError with server message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ message: 'Forbidden' }),
    }) as typeof fetch;

    await expect(apiClient.get('/secret')).rejects.toMatchObject({
      status: 403,
      message: 'Forbidden',
    });
    await expect(apiClient.get('/secret')).rejects.toBeInstanceOf(ApiError);
  });

  it('apiClient.delete handles 204 No Content', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
    }) as typeof fetch;

    await expect(apiClient.delete('/items/1')).resolves.toBeUndefined();
  });

  it('getApiData returns fallback when request fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as typeof fetch;
    await expect(getApiData('/x', { items: [] })).resolves.toEqual({ items: [] });
  });
});
