'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';
import { SidebarNav } from './sidebar-nav';
import { useShellNav } from './shell-nav-context';
import styles from './MobileNavDrawer.module.scss';

export function MobileNavDrawer() {
  const { mobileNavOpen, closeMobileNav } = useShellNav();

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileNav();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileNavOpen, closeMobileNav]);

  useEffect(() => {
    document.documentElement.classList.toggle('--scroll-lock', mobileNavOpen);
    return () => document.documentElement.classList.remove('--scroll-lock');
  }, [mobileNavOpen]);

  if (!mobileNavOpen) return null;

  return (
    <div className={styles.root} role="presentation">
      <div className={styles.backdrop} aria-hidden onClick={closeMobileNav} />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Menu</span>
          <Button
            type="button"
            className={styles.closeBtn}
            onClick={closeMobileNav}
            aria-label="Close menu"
          >
            <X size={20} aria-hidden />
          </Button>
        </div>
        <div className={styles.panelBody}>
          <SidebarNav variant="drawer" onNavigate={closeMobileNav} />
        </div>
      </div>
    </div>
  );
}
