'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';
import { BrandLogo } from '../brand/BrandLogo';
import { useOpenCreateLesson } from '../../features/lesson-modal';
import { useActiveUser } from '../../lib/active-user';
import { canSchedule } from '../../mocks';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { prefersReducedMotion } from '../../lib/motion';
import { SidebarNav } from './sidebar-nav';
import { useShellNav } from './shell-nav-context';
import { useDrawerSwipe } from './use-drawer-swipe';
import navStyles from './Sidebar.module.scss';
import styles from './MobileNavDrawer.module.scss';

/** Fallback на випадок втраченого transitionend (фонова вкладка тощо). */
const CLOSE_FALLBACK_MS = 280;

export function MobileNavDrawer() {
  const { mobileNavOpen, closeMobileNav } = useShellNav();
  const activeUser = useActiveUser();
  const openCreateLesson = useOpenCreateLesson();
  const showCreateLesson = canSchedule('lessons', activeUser.role);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const titleId = 'mobile-nav-drawer-title';

  /* Exit-анімація перед unmount: closing-клас веде панель у -100%,
     unmount — на transitionend (+ таймаут-страховка). */
  const requestClose = useCallback(() => {
    if (!mobileNavOpen) return;
    if (prefersReducedMotion()) {
      closeMobileNav();
      return;
    }
    setClosing(true);
  }, [mobileNavOpen, closeMobileNav]);

  const finishClose = useCallback(() => {
    setClosing(false);
    closeMobileNav();
  }, [closeMobileNav]);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = window.setTimeout(finishClose, CLOSE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [closing, finishClose]);

  useEffect(() => {
    if (!mobileNavOpen) setClosing(false);
  }, [mobileNavOpen]);

  useDrawerSwipe(panelRef, mobileNavOpen && !closing, requestClose);

  useFocusTrap(mobileNavOpen, panelRef, closeBtnRef);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileNavOpen, requestClose]);

  useEffect(() => {
    document.documentElement.classList.toggle('--scroll-lock', mobileNavOpen);
    return () => document.documentElement.classList.remove('--scroll-lock');
  }, [mobileNavOpen]);

  useEffect(() => {
    const main = document.querySelector<HTMLElement>('[data-app-shell-main]');
    if (!main) return;
    if (mobileNavOpen) {
      main.setAttribute('inert', '');
      main.setAttribute('aria-hidden', 'true');
    } else {
      main.removeAttribute('inert');
      main.removeAttribute('aria-hidden');
    }
    return () => {
      main.removeAttribute('inert');
      main.removeAttribute('aria-hidden');
    };
  }, [mobileNavOpen]);

  if (!mobileNavOpen) return null;

  const onCreateLesson = () => {
    closeMobileNav();
    openCreateLesson();
  };

  return (
    <div className={styles.root} role="presentation" data-mobile-nav-drawer>
      <div
        className={[styles.backdrop, closing ? styles.backdropClosing : ''].filter(Boolean).join(' ')}
        aria-hidden
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        className={[styles.panel, closing ? styles.panelClosing : ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onTransitionEnd={(event) => {
          if (closing && event.target === panelRef.current && event.propertyName === 'transform') {
            finishClose();
          }
        }}
      >
        <div className={styles.panelHead}>
          <div className={styles.panelTitle} id={titleId}>
            <BrandLogo size="sm" showTag={false} />
          </div>
          <Button
            ref={closeBtnRef}
            type="button"
            variant="ghost"
            className={styles.closeBtn}
            onClick={requestClose}
            aria-label="Close menu"
          >
            <X size={20} aria-hidden />
          </Button>
        </div>

        <div className={`${styles.panelBody} ${navStyles.drawerNav}`}>
          <SidebarNav variant="drawer" onNavigate={closeMobileNav} />
        </div>

        {showCreateLesson ? (
          <div className={styles.panelFoot}>
            <Button type="button" variant="primary" className={styles.createLessonBtn} onClick={onCreateLesson}>
              Create lesson
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
