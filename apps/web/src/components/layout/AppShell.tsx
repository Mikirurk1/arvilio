'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthGate } from './AuthGate';
import styles from '../../app/layout.module.scss';

const NAKED_ROUTES = ['/login'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isNaked = NAKED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

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
      </div>
    </AuthGate>
  );
}
