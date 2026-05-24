import { graphqlRequest } from '../../lib/graphql-client';
import { loadInitialPage, loadNextPage } from './paginated-api';

jest.mock('../../lib/graphql-client', () => ({
  graphqlRequest: jest.fn(),
}));

describe('paginated-api loaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loadInitialPage reads nested field from GraphQL response', async () => {
    (graphqlRequest as jest.Mock).mockResolvedValue({
      inbox: { items: [{ id: '1' }], hasMore: true, nextCursor: 'c1' },
    });
    const page = await loadInitialPage<{ id: string }>(
      'query Inbox { inbox(limit: $limit) { items { id } hasMore nextCursor } }',
      'inbox',
      {},
    );
    expect(page.items).toHaveLength(1);
    expect(page.nextCursor).toBe('c1');
  });

  it('loadNextPage passes cursor variable', async () => {
    (graphqlRequest as jest.Mock).mockResolvedValue({
      messages: { items: [{ id: '2' }], hasMore: false, nextCursor: null },
    });
    const page = await loadNextPage<{ id: string }>('query', 'messages', { conversationId: 'c1' }, 'cur-1');
    expect(graphqlRequest).toHaveBeenCalledWith(
      'query',
      expect.objectContaining({ cursor: 'cur-1', conversationId: 'c1' }),
    );
    expect(page.hasMore).toBe(false);
  });
});
