'use client';

import { ComponentType, useEffect, useState, type ReactNode } from 'react';

/**
 * Client-only code split without React.lazy / Suspense (avoids boundary cleanup
 * bugs when navigating away from pages with multiple lazy tab panels).
 */
export function createLazyPanel<P extends object>(
  loader: () => Promise<ComponentType<P>>,
  renderLoading: () => ReactNode,
) {
  function LazyPanel(props: P) {
    const [Component, setComponent] = useState<ComponentType<P> | null>(null);

    useEffect(() => {
      let cancelled = false;
      void loader().then((Resolved) => {
        if (!cancelled) setComponent(() => Resolved);
      });
      return () => {
        cancelled = true;
      };
    }, []);

    if (!Component) return <>{renderLoading()}</>;
    return <Component {...props} />;
  }

  LazyPanel.displayName = 'LazyPanel';
  return LazyPanel;
}
