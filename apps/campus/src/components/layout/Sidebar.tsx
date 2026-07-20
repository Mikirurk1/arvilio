'use client';

import { Suspense, useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '../ui';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { SidebarNav } from './sidebar-nav';
import { LocaleSwitcher } from '../i18n/LocaleSwitcher';
import styles from './Sidebar.module.scss';

const STORAGE_KEY = 'arvilio.sidebarCollapsed';

export default function Sidebar() {
  const { isMobile, isTablet } = useBreakpoint();
  const [userCollapsed, setUserCollapsed] = useState(false);

  const collapsed = isTablet || userCollapsed;

  useEffect(() => {
    if (isMobile || isTablet) return;
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1') {
        setUserCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty('--sidebar-w', '0px');
      document.documentElement.removeAttribute('data-sidebar-collapsed');
      return;
    }
    document.documentElement.style.setProperty(
      '--sidebar-w',
      collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w-expanded)',
    );
    document.documentElement.setAttribute('data-sidebar-collapsed', collapsed ? 'true' : 'false');
    if (!isTablet) {
      try {
        localStorage.setItem(STORAGE_KEY, userCollapsed ? '1' : '0');
      } catch {
        /* ignore */
      }
    }
  }, [collapsed, isMobile, isTablet, userCollapsed]);

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--sidebar-w');
      document.documentElement.removeAttribute('data-sidebar-collapsed');
    };
  }, []);

  if (isMobile) return null;

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <SidebarNav collapsed={collapsed} variant="rail" />
      <div className={styles.toolbar}>
        <Suspense fallback={null}><LocaleSwitcher compact={collapsed} className={styles.localeSwitcher} /></Suspense>
        <Button
          type="button"
          variant="ghost"
          className={styles.toggleBtn}
          onClick={() => setUserCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          disabled={isTablet}
          title={isTablet ? 'Expanded sidebar on tablet is not available' : undefined}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} strokeWidth={2} aria-hidden />
          ) : (
            <PanelLeftClose size={18} strokeWidth={2} aria-hidden />
          )}
        </Button>
      </div>
    </aside>
  );
}
