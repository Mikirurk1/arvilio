const STORAGE_KEY = 'cookie_consent';

export type ConsentChoice = 'accepted' | 'declined';

export function getConsentChoice(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'accepted' || v === 'declined') return v;
  return null;
}

export function setConsentChoice(choice: ConsentChoice): void {
  localStorage.setItem(STORAGE_KEY, choice);
}

export function hasAnalyticsConsent(): boolean {
  return getConsentChoice() === 'accepted';
}
