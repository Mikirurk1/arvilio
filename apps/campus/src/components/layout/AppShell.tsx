'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { MobileNavDrawer } from './MobileNavDrawer';
import { LessonEditorHost } from '../../features/lesson-modal';
import { MediaViewerHost } from './MediaViewerHost';
import { ProductTour } from '../tour/ProductTour';
import { ShellNavProvider, useShellNav } from './shell-nav-context';
import { stripLocalePrefix } from '@pkg/types';
import { useCampusT } from '../../lib/cms';
import styles from '../../app/layout.module.scss';

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { closeMobileNav } = useShellNav();
  const t = useCampusT();
  const appPath = stripLocalePrefix(pathname || '/').pathname;
  const focusMode = appPath.startsWith('/materials/view');

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  return (
    <div className={styles.shell} data-app-shell data-focus-mode={focusMode ? 'true' : undefined}>
      <Link href="#main-content" className={styles.skipLink}>
        {t('a11y.skipToMain')}
      </Link>
      <Header />
      <div className={styles.body} data-app-shell-body>
        {!focusMode ? <Sidebar /> : null}
        <main id="main-content" className={styles.main} data-app-shell-main tabIndex={-1}>
          <div className={styles.mainCanvas}>{children}</div>
        </main>
      </div>
      {!focusMode ? <MobileNavDrawer /> : null}
      <MediaViewerHost />
      {/* Same client gate as AppShell: after soft login Header shows Help but layout
          SSR may still lack requestAuth.user — tour must mount with the shell. */}
      <ProductTour />
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
