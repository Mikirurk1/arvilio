/** Default page size for list infinite scroll (keep in sync with backend defaults). */
export const DEFAULT_PAGE_SIZE = 25;

export type PaginatedSlice<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  loadingMore: boolean;
};

export function createIdlePaginatedSlice<T>(): PaginatedSlice<T> {
  return {
    items: [],
    hasMore: false,
    nextCursor: null,
    status: 'idle',
    error: null,
    loadingMore: false,
  };
}
