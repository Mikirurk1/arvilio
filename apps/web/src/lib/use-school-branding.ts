'use client';

import { useEffect, useState } from 'react';

export interface SchoolBranding {
  brandColor: string | null;
  logoUrl: string | null;
}

let cached: SchoolBranding | null = null;
let inflight: Promise<SchoolBranding | null> | null = null;

async function fetchBranding(): Promise<SchoolBranding | null> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch('/api/school/branding')
    .then((r) => (r.ok ? (r.json() as Promise<SchoolBranding>) : null))
    .then((d) => {
      cached = d;
      inflight = null;
      return d;
    })
    .catch(() => {
      inflight = null;
      return null;
    });
  return inflight;
}

export function useSchoolBranding(): SchoolBranding | null {
  const [branding, setBranding] = useState<SchoolBranding | null>(cached);

  useEffect(() => {
    if (cached) return;
    void fetchBranding().then(setBranding);
  }, []);

  return branding;
}
