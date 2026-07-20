import { headers } from 'next/headers';
import { readRequestAuthState } from '../auth/request-session';
import { normalizeCampusLocale } from './campus-cms';
import type { Locale } from '@pkg/types';

export async function resolveRequestCampusLocale(): Promise<Locale> {
  const requestAuth = readRequestAuthState(await headers());
  return normalizeCampusLocale(requestAuth.locale);
}
