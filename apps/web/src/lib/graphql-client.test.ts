import { GraphqlError, graphqlRequest } from './graphql-client';

describe('graphqlRequest', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as typeof fetch;
  });

  it('returns data on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { hello: 'world' } }),
    });
    await expect(graphqlRequest<{ hello: string }>('query')).resolves.toEqual({ hello: 'world' });
  });

  it('throws GraphqlError on HTTP error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'server error',
    });
    await expect(graphqlRequest('query')).rejects.toBeInstanceOf(GraphqlError);
  });

  it('throws GraphqlError on graphql errors array', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: 'Forbidden' }] }),
    });
    await expect(graphqlRequest('query')).rejects.toThrow('Forbidden');
  });

  it('refreshes session and retries once on HTTP 401', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => '',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { hello: 'world' } }),
      });

    await expect(graphqlRequest<{ hello: string }>('query')).resolves.toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('refreshes session and retries once on graphql unauthorized error', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ errors: [{ message: 'Unauthorized' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => '',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { hello: 'world' } }),
      });

    await expect(graphqlRequest<{ hello: string }>('query')).resolves.toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
