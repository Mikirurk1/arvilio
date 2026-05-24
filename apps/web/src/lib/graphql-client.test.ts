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
});
