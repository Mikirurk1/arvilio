'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { SidebarNav } from './sidebar-nav';
import styles from './Sidebar.module.scss';

const STORAGE_KEY = 'soenglish.sidebarCollapsed';

function CollapseIcon({ expanded }: { expanded: boolean }) {
  return expanded ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M12 4.5v9M6 9l6-4.5M6 9l6 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.5 3.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M6 4.5v9M12 9L6 4.5M12 9l-6 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.5 3.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '72px' : '240px');
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
        <Button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setUserCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          disabled={isTablet}
          title={isTablet ? 'Expanded sidebar on tablet is not available' : undefined}
        >
          <CollapseIcon expanded={!collapsed} />
        </Button>
      </div>
    </aside>
  );
}
