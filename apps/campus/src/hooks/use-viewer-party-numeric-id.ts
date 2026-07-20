'use client';

import { useMemo } from 'react';
import { partyNumericId } from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useOptionalAuth } from '../lib/auth-context';

/** Numeric party id for the signed-in user (matches lesson studentId / teacherId from backend). */
export function useViewerPartyNumericId(): number | null {
  const auth = useOptionalAuth();
  return useMemo(
    () => (auth?.user?.id ? partyNumericId(auth.user.id) : null),
    [auth?.user?.id],
  );
}
