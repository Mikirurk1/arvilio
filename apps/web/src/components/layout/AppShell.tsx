'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { MobileNavDrawer } from './MobileNavDrawer';
import { LessonEditorHost } from '../../features/lesson-modal';
import { MediaViewerHost } from './MediaViewerHost';
import { ShellNavProvider, useShellNav } from './shell-nav-context';
import styles from '../../app/layout.module.scss';

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { closeMobileNav } = useShellNav();
  const focusMode = pathname.startsWith('/materials/view');

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  return (
    <div className={styles.shell} data-app-shell data-focus-mode={focusMode ? 'true' : undefined}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Header />
      <div className={styles.body} data-app-shell-body>
        {!focusMode ? <Sidebar /> : null}
        <main id="main-content" className={styles.main} data-app-shell-main tabIndex={-1}>
          <div className={styles.mainCanvas}>{children}</div>
        </main>
      </div>
      {!focusMode ? <MobileNavDrawer /> : null}
      <MediaViewerHost />
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
