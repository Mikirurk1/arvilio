import {
  createIdleSlice,
  isSliceStale,
  sliceError,
  sliceLoading,
  sliceSuccess,
} from './async-slice';

describe('async-slice', () => {
  it('createIdleSlice starts idle', () => {
    expect(createIdleSlice<string>()).toEqual({
      data: null,
      status: 'idle',
      error: null,
      fetchedAt: null,
    });
  });

  it('sliceLoading clears error and sets loading', () => {
    const prev = { ...createIdleSlice<number>(), status: 'error' as const, error: 'x' };
    expect(sliceLoading(prev).status).toBe('loading');
    expect(sliceLoading(prev).error).toBeNull();
  });

  it('sliceSuccess stores data and timestamp', () => {
    const prev = sliceLoading(createIdleSlice<number>());
    const next = sliceSuccess(prev, 42);
    expect(next.data).toBe(42);
    expect(next.status).toBe('success');
    expect(next.fetchedAt).toBeGreaterThan(0);
  });

  it('sliceError maps Error message', () => {
    const prev = sliceLoading(createIdleSlice<number>());
    const next = sliceError(prev, new Error('network down'));
    expect(next.status).toBe('error');
    expect(next.error).toBe('network down');
  });

  it('isSliceStale is true without fetchedAt', () => {
    expect(isSliceStale(createIdleSlice(), 1000)).toBe(true);
  });

  it('isSliceStale respects maxAgeMs', () => {
    const slice = sliceSuccess(createIdleSlice<number>(), 1);
    const old = { ...slice, fetchedAt: Date.now() - 10_000 };
    expect(isSliceStale(old, 5000)).toBe(true);
    expect(isSliceStale(slice, 60_000)).toBe(false);
  });
});
