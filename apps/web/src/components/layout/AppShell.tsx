'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { MobileNavDrawer } from './MobileNavDrawer';
import { LessonEditorHost } from '../../features/lesson-modal';
import { ShellNavProvider, useShellNav } from './shell-nav-context';
import styles from '../../app/layout.module.scss';

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { closeMobileNav } = useShellNav();

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  return (
    <div className={styles.shell} data-app-shell>
      <Header />
      <div className={styles.body} data-app-shell-body>
        <Sidebar />
        <main className={styles.main} data-app-shell-main>
          {children}
        </main>
      </div>
      <MobileNavDrawer />
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellNavProvider>
      <LessonEditorHost>
        <AppShellInner>{children}</AppShellInner>
      </LessonEditorHost>
    </ShellNavProvider>
  );
}
