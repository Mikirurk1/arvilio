'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthSessionDto, AuthUserDto, LoginRequestDto } from '@pkg/types';
import { apiClient, ApiError, GOOGLE_SIGN_IN_URL } from '../lib/api';

declare global {
  interface Window {
    __SOENGLISH_AUTH__?: {
      user: AuthUserDto | null;
    };
  }
}

type AuthState = {
  user: AuthUserDto | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  googleSignInUrl: string;
  refresh: () => Promise<void>;
  login: (body: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
};

function readBootstrappedSession(): { user: AuthUserDto | null; initialized: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, initialized: false };
  }
  if (!('__SOENGLISH_AUTH__' in window)) {
    return { user: null, initialized: false };
  }
  return {
    user: window.__SOENGLISH_AUTH__?.user ?? null,
    initialized: true,
  };
}

const initialSession = readBootstrappedSession();

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: initialSession.user,
      initialized: initialSession.initialized,
      loading: false,
      error: null,
      googleSignInUrl: GOOGLE_SIGN_IN_URL,

      refresh: async () => {
        set({ loading: true }, false, 'auth/refresh:start');
        try {
          const session = await apiClient.get<AuthSessionDto>('/auth/me');
          set(
            { user: session.user, initialized: true, error: null, loading: false },
            false,
            'auth/refresh:success',
          );
        } catch (err) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            set(
              { user: null, initialized: true, error: null, loading: false },
              false,
              'auth/refresh:anonymous',
            );
            return;
          }
          set(
            {
              user: null,
              initialized: true,
              error: err instanceof Error ? err.message : 'Failed to load session',
              loading: false,
            },
            false,
            'auth/refresh:error',
          );
        }
      },

      login: async (body) => {
        set({ error: null }, false, 'auth/login:start');
        try {
          const session = await apiClient.post<AuthSessionDto>('/auth/login', body);
          set(
            { user: session.user, initialized: true, loading: false },
            false,
            'auth/login:success',
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ error: message }, false, 'auth/login:error');
          throw err;
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          // ignore network errors on logout
        }
        set({ user: null, initialized: true, loading: false }, false, 'auth/logout');
      },
    }),
    { name: 'soenglish/auth' },
  ),
);
