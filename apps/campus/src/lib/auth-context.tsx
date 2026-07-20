'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';
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

const AuthBootstrapContext = createContext<AuthUserDto | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AuthUserDto | null;
}) {
  return <AuthBootstrapContext.Provider value={initialUser}>{children}</AuthBootstrapContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const initialUser = useContext(AuthBootstrapContext);
  const authState = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      initialized: state.initialized,
      loading: state.loading,
      error: state.error,
      login: state.login,
      logout: state.logout,
      refresh: state.refresh,
      googleSignInUrl: state.googleSignInUrl,
    })),
  );
  return useMemo(
    () => ({
      user: authState.initialized ? authState.user : (authState.user ?? initialUser),
      loading: authState.loading,
      error: authState.error,
      login: authState.login,
      logout: authState.logout,
      refresh: authState.refresh,
      googleSignInUrl: authState.googleSignInUrl,
    }),
    [authState, initialUser],
  );
}

export function useOptionalAuth(): AuthContextValue {
  return useAuth();
}
