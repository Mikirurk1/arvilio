'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { sanitizeEnabledLocales, type Locale } from '@pkg/types';
import { apiClient } from '../lib/api';

interface SchoolLocaleResponse {
  defaultLocale: Locale;
  enabledLocales: Locale[];
}

type SchoolLocalesSlice = {
  enabledLocales: Locale[] | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  fetch: (force?: boolean) => Promise<void>;
};

const useSchoolLocalesStore = create<SchoolLocalesSlice>((set, get) => ({
  enabledLocales: null,
  status: 'idle',
  fetch: async (force = false) => {
    const prev = get();
    if (!force && (prev.status === 'loading' || prev.status === 'success')) return;
    set({ status: 'loading' });
    try {
      const data = await apiClient.get<SchoolLocaleResponse>('/school/locale');
      set({ enabledLocales: sanitizeEnabledLocales(data.enabledLocales), status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },
}));

/**
 * School-offered UI locales (G33) for the locale switcher. Falls back to the
 * platform shipped set until the tenant setting loads or when tenant-less.
 */
export function useSchoolLocales(): Locale[] {
  const enabledLocales = useSchoolLocalesStore((s) => s.enabledLocales);
  const fetch = useSchoolLocalesStore((s) => s.fetch);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return enabledLocales ?? sanitizeEnabledLocales(null);
}
