'use client';

import { useEffect } from 'react';

/**
 * Warns when the user tries to close/refresh or use browser Back while work is in progress.
 */
export function useNavigationLock(active: boolean, message: string) {
  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    const onPopState = () => {
      const leave = window.confirm(message);
      if (!leave) {
        history.pushState({ navigationLock: true }, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('popstate', onPopState);
    history.pushState({ navigationLock: true }, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [active, message]);
}
