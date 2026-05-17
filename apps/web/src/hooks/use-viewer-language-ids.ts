'use client';

import { useEffect } from 'react';
import { selectEnglishLanguageId, useLanguagesStore } from '../stores/languages-store';
import { useProfileStore } from '../stores/profile-store';

export function useViewerLanguageIds(): {
  nativeLanguageId: string | null;
  englishLanguageId: string | undefined;
  profileReady: boolean;
} {
  const profileStatus = useProfileStore((s) => s.profile.status);
  const nativeLanguageId = useProfileStore((s) => s.profile.data?.nativeLanguageId ?? null);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const fetchLanguages = useLanguagesStore((s) => s.fetchLanguages);
  const englishLanguageId = useLanguagesStore(selectEnglishLanguageId);

  useEffect(() => {
    void fetchProfile();
    void fetchLanguages();
  }, [fetchProfile, fetchLanguages]);

  return {
    nativeLanguageId,
    englishLanguageId,
    profileReady: profileStatus === 'success' || profileStatus === 'error',
  };
}
