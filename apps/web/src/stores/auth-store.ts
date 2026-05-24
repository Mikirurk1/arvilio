'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthSessionDto, AuthUserDto, LoginRequestDto } from '@pkg/types';
import { apiClient, ApiError, GOOGLE_SIGN_IN_URL } from '../lib/api';

type AuthState = {
  user: AuthUserDto | null;
  loading: boolean;
  error: string | null;
  googleSignInUrl: string;
  refresh: () => Promise<void>;
  login: (body: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      googleSignInUrl: GOOGLE_SIGN_IN_URL,

      refresh: async () => {
        set({ loading: true }, false, 'auth/refresh:start');
        try {
          const session = await apiClient.get<AuthSessionDto>('/auth/me');
          set({ user: session.user, error: null, loading: false }, false, 'auth/refresh:success');
        } catch (err) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            try {
              const session = await apiClient.post<AuthSessionDto>('/auth/refresh');
              set(
                { user: session.user, error: null, loading: false },
                false,
                'auth/refresh:rotated',
              );
              return;
            } catch {
              set({ user: null, error: null, loading: false }, false, 'auth/refresh:anonymous');
              return;
            }
          }
          set(
            {
              user: null,
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
          set({ user: session.user }, false, 'auth/login:success');
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
        set({ user: null }, false, 'auth/logout');
      },
    }),
    { name: 'soenglish/auth' },
  ),
);
