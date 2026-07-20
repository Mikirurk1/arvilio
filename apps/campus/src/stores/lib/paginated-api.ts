import { graphqlRequest } from '../../lib/graphql-client';
import type { PaginatedSlice } from './paginated-slice';
import { DEFAULT_PAGE_SIZE } from './paginated-slice';

export type PageResult<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
};

export async function loadInitialPage<T>(
  query: string,
  field: string,
  variables: Record<string, unknown>,
): Promise<PageResult<T>> {
  const data = await graphqlRequest<Record<string, PageResult<T>>>(query, {
    limit: DEFAULT_PAGE_SIZE,
    ...variables,
  });
  return data[field]!;
}

export async function loadNextPage<T>(
  query: string,
  field: string,
  variables: Record<string, unknown>,
  cursor: string,
): Promise<PageResult<T>> {
  const data = await graphqlRequest<Record<string, PageResult<T>>>(query, {
    limit: DEFAULT_PAGE_SIZE,
    cursor,
    ...variables,
  });
  return data[field]!;
}

export function mergePageItems<T extends { id: string }>(
  page: PaginatedSlice<T>,
  next: PageResult<T>,
): PaginatedSlice<T> {
  const seen = new Set(page.items.map((row) => row.id));
  const merged = [...page.items, ...next.items.filter((row) => !seen.has(row.id))];
  return {
    items: merged,
    hasMore: next.hasMore,
    nextCursor: next.nextCursor,
    status: 'success',
    error: null,
    loadingMore: false,
  };
}
