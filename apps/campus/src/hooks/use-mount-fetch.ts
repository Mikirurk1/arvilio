import { useEffect } from 'react'

/**
 * Calls fetchFn once on mount. Pass a stable reference (from Zustand store selector).
 * Optional `enabled` guard — when false, fetch is skipped entirely.
 */
export function useMountFetch(fetchFn: () => unknown, enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    void fetchFn()
    // fetchFn identity is stable from Zustand — exhaustive-deps warning here is safe to ignore
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}
