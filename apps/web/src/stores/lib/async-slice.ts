export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type AsyncSlice<T> = {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
  fetchedAt: number | null;
};

export function createIdleSlice<T>(): AsyncSlice<T> {
  return { data: null, status: 'idle', error: null, fetchedAt: null };
}

export function sliceLoading<T>(prev: AsyncSlice<T>): AsyncSlice<T> {
  return { ...prev, status: 'loading', error: null };
}

export function sliceSuccess<T>(prev: AsyncSlice<T>, data: T): AsyncSlice<T> {
  return { data, status: 'success', error: null, fetchedAt: Date.now() };
}

export function sliceError<T>(prev: AsyncSlice<T>, error: unknown): AsyncSlice<T> {
  const message = error instanceof Error ? error.message : 'Request failed';
  return { ...prev, status: 'error', error: message };
}

export function isSliceStale(slice: AsyncSlice<unknown>, maxAgeMs: number): boolean {
  if (!slice.fetchedAt) return true;
  return Date.now() - slice.fetchedAt > maxAgeMs;
}
