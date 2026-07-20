import { createIdlePaginatedSlice, DEFAULT_PAGE_SIZE } from './paginated-slice';

describe('paginated-slice', () => {
  it('DEFAULT_PAGE_SIZE is 25', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(25);
  });

  it('createIdlePaginatedSlice returns empty idle page', () => {
    expect(createIdlePaginatedSlice<{ id: string }>()).toEqual({
      items: [],
      hasMore: false,
      nextCursor: null,
      status: 'idle',
      error: null,
      loadingMore: false,
    });
  });
});
