'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

const PUBLIC_ROUTES = ['/login'];

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, isPublic, pathname, router]);

  if (loading && !isPublic) {
    return null;
  }
  if (!user && !isPublic) {
    return null;
  }
  return <>{children}</>;
}
