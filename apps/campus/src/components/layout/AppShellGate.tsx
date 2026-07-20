'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { classifyRouteAccess, type ShellVariant } from '../../lib/auth/route-policy';
import AppShell from './AppShell';

type Props = {
  children: ReactNode;
  initialShell: ShellVariant;
};

/**
 * Picks app vs auth chrome on the client. Needed because the root layout is chosen
 * once on the server — after login, soft navigation to /dashboard must still mount AppShell.
 */
export function AppShellGate({ children, initialShell }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const route = classifyRouteAccess(pathname);
  const showAppShell =
    route.shell === 'app' && (initialShell === 'app' || user !== null);

  if (showAppShell) {
    return <AppShell>{children}</AppShell>;
  }

  return children;
}
