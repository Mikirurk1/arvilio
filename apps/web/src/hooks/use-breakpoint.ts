'use client';

import { useEffect, useState } from 'react';
import {
  BREAKPOINTS,
  MOBILE_MAX_WIDTH,
  TABLET_MAX_WIDTH,
  tierFromWidth,
  type BreakpointTier,
} from '../lib/breakpoints';

export type BreakpointState = {
  width: number;
  tier: BreakpointTier;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

function readBreakpoint(): BreakpointState {
  if (typeof window === 'undefined') {
    return {
      width: BREAKPOINTS.md,
      tier: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }
  const width = window.innerWidth;
  const tier = tierFromWidth(width);
  return {
    width,
    tier,
    isMobile: tier === 'mobile',
    isTablet: tier === 'tablet',
    isDesktop: tier === 'desktop',
  };
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(readBreakpoint);

  useEffect(() => {
    const mobileMq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const tabletMq = window.matchMedia(
      `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${TABLET_MAX_WIDTH}px)`,
    );

    const apply = () => setState(readBreakpoint());

    apply();
    mobileMq.addEventListener('change', apply);
    tabletMq.addEventListener('change', apply);
    window.addEventListener('resize', apply);

    return () => {
      mobileMq.removeEventListener('change', apply);
      tabletMq.removeEventListener('change', apply);
      window.removeEventListener('resize', apply);
    };
  }, []);

  return state;
}
