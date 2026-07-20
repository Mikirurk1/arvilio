'use client';

import { useEffect, useState } from 'react';
import { MOBILE_MAX_WIDTH } from '../../lib/breakpoints';

/** Native date/time inputs on small screens; custom popover pickers on desktop. */
export function usePickerMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  return isMobile;
}
