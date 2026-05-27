'use client';

import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';
import { useAuthStore } from '../stores/auth-store';
import { mockAuthUser } from '../testing/fixtures';

function RoleProbe() {
  const auth = useAuth();
  return <span>{auth.user?.role ?? 'anonymous'}</span>;
}

describe('auth-context', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      initialized: false,
      loading: false,
      error: null,
      googleSignInUrl: '/api/auth/google',
    });
  });

  it('uses provider initial user before auth store initializes', () => {
    render(
      <AuthProvider initialUser={mockAuthUser({ role: 'super_admin' })}>
        <RoleProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('super_admin')).toBeInTheDocument();
  });

  it('does not fall back to initial user after the store is explicitly anonymous', () => {
    useAuthStore.setState({ user: null, initialized: true });

    render(
      <AuthProvider initialUser={mockAuthUser({ role: 'super_admin' })}>
        <RoleProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('anonymous')).toBeInTheDocument();
  });
});
