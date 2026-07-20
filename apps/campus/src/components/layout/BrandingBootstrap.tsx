'use client';

import { useEffect } from 'react';
import { useSchoolBranding } from '../../lib/use-school-branding';

/** Applies school brand color CSS tokens once branding data loads. */
export function BrandingBootstrap() {
  const branding = useSchoolBranding();

  useEffect(() => {
    if (!branding?.brandColor) return;
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', branding.brandColor);
    root.style.setProperty(
      '--accent-primary-hover',
      `color-mix(in srgb, ${branding.brandColor} 85%, #000)`,
    );
    root.style.setProperty(
      '--accent-primary-muted',
      `color-mix(in srgb, ${branding.brandColor} 12%, var(--card))`,
    );
  }, [branding?.brandColor]);

  return null;
}
