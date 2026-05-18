'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthGate } from './AuthGate';
import { MobileNavDrawer } from './MobileNavDrawer';
import { ShellNavProvider, useShellNav } from './shell-nav-context';
import styles from '../../app/layout.module.scss';

const NAKED_ROUTES = ['/login'];

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { closeMobileNav } = useShellNav();
  const isNaked = NAKED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  if (isNaked) {
    return <AuthGate>{children}</AuthGate>;
  }

  return (
    <AuthGate>
      <div className={styles.shell}>
        <Header />
        <div className={styles.body}>
          <Sidebar />
          <main className={styles.main}>{children}</main>
        </div>
        <MobileNavDrawer />
      </div>
    </AuthGate>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellNavProvider>
      <AppShellInner>{children}</AppShellInner>
    </ShellNavProvider>
  );
}
