'use client';

import { useMemo } from 'react';
import { getTimeZoneLabelFromIana, ianaToTimeZoneId } from '../lib/lessonTime';
import { useOptionalAuth } from '../lib/auth-context';

/** Signed-in user's profile timezone (IANA), with Kyiv fallback. */
export function useViewerTimezone() {
  const auth = useOptionalAuth();
  return useMemo(() => {
    const iana = auth?.user?.timezone?.trim() || 'Europe/Kyiv';
    const timezoneId = ianaToTimeZoneId(iana);
    return { iana, timezoneId, label: getTimeZoneLabelFromIana(iana) };
  }, [auth?.user?.timezone]);
}
