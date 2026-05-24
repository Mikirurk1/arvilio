'use client';

import { ReactNode, useEffect } from 'react';
import type { AuthUserDto, LoginRequestDto } from '@pkg/types';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../stores/auth-store';

export type AuthContextValue = {
  user: AuthUserDto | null;
  loading: boolean;
  error: string | null;
  login: (body: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  googleSignInUrl: string;
};

/** Bootstraps session on mount; state lives in Zustand (`useAuthStore`). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const refresh = useAuthStore((state) => state.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return children;
}

export function useAuth(): AuthContextValue {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      loading: state.loading,
      error: state.error,
      login: state.login,
      logout: state.logout,
      refresh: state.refresh,
      googleSignInUrl: state.googleSignInUrl,
    })),
  );
}

export function useOptionalAuth(): AuthContextValue {
  return useAuth();
}
