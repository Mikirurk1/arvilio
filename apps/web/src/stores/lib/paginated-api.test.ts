import { mergePageItems } from './paginated-api';
import { createIdlePaginatedSlice } from './paginated-slice';

describe('paginated-api', () => {
  it('mergePageItems deduplicates by id', () => {
    const page = {
      ...createIdlePaginatedSlice<{ id: string; name: string }>(),
      status: 'success' as const,
      items: [{ id: 'a', name: 'A' }],
      hasMore: true,
      nextCursor: 'c1',
    };
    const merged = mergePageItems(page, {
      items: [
        { id: 'a', name: 'A-dup' },
        { id: 'b', name: 'B' },
      ],
      hasMore: false,
      nextCursor: null,
    });
    expect(merged.items.map((r) => r.id)).toEqual(['a', 'b']);
    expect(merged.hasMore).toBe(false);
    expect(merged.loadingMore).toBe(false);
  });
});
