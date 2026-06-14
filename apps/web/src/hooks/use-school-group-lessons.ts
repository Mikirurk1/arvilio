'use client';

import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS, type SchoolGroupLessonsSettingsDto } from '@pkg/types';
import { graphqlRequest } from '../lib/graphql-client';
import { SCHOOL_GROUP_LESSONS_SETTINGS } from '../graphql/operations';

type SchoolGroupLessonsSlice = {
  settings: SchoolGroupLessonsSettingsDto | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  fetch: (force?: boolean) => Promise<void>;
};

const useSchoolGroupLessonsStore = create<SchoolGroupLessonsSlice>((set, get) => ({
  settings: null,
  status: 'idle',
  error: null,
  fetch: async (force = false) => {
    const prev = get();
    if (!force && prev.status === 'success' && prev.settings) return;
    set({ status: 'loading', error: null });
    try {
      const data = await graphqlRequest<{
        schoolGroupLessonsSettings: SchoolGroupLessonsSettingsDto;
      }>(SCHOOL_GROUP_LESSONS_SETTINGS);
      set({
        settings: data.schoolGroupLessonsSettings,
        status: 'success',
        error: null,
      });
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to load group lessons settings',
      });
    }
  },
}));

/** School-wide group lessons feature flag and defaults (staff-readable). */
export function useSchoolGroupLessons() {
  const settings = useSchoolGroupLessonsStore((s) => s.settings);
  const status = useSchoolGroupLessonsStore((s) => s.status);
  const fetch = useSchoolGroupLessonsStore((s) => s.fetch);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const resolved = settings ?? DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS;

  return useMemo(
    () => ({
      enabled: resolved.enabled,
      settings: resolved,
      loading: status === 'loading' || status === 'idle',
      error: useSchoolGroupLessonsStore.getState().error,
      refresh: () => fetch(true),
    }),
    [resolved, status, fetch],
  );
}

/** @deprecated Use `useSchoolGroupLessons().enabled` */
export function useGroupLessonsEnabled(): boolean {
  return useSchoolGroupLessons().enabled;
}
