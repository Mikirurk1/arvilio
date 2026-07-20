import { headers } from 'next/headers';
import { readRequestAuthState, type RequestAuthState } from '../auth/request-session';

export async function getRequestAuthState(): Promise<RequestAuthState> {
  return readRequestAuthState(await headers());
}
