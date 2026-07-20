'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Link2,
  Monitor,
  Moon,
  Package,
  ScrollText,
  Settings,
  Sun,
  Ticket,
  Users,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@fe/ui';
import {
  applyThemeToDocument,
  persistThemeMode,
  readPersistedThemeMode,
  resolveThemeMode,
  type ThemeMode,
} from '../lib/appearance';
import styles from './ConsoleShell.module.scss';

type NavItem = {
  label: string;
  href?: string;
  soon?: boolean;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Control Plane shell. Connect product surfaces stay disabled stubs until
 * Connect ships (product-registry seam — ADR-009 / ecosystem plan).
 */
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Fleet',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Campuses', href: '/schools', icon: Building2 },
      { label: 'Users', href: '/users', icon: Users },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Payment rails', href: '/billing/rails', icon: CreditCard },
      { label: 'Campus plans', href: '/billing/campus-plans', icon: Package },
      { label: 'Promo codes', href: '/promo-codes', icon: Ticket },
    ],
  },
  {
    label: 'Ops',
    items: [
      { label: 'Audit log', href: '/audit-log', icon: ScrollText },
      { label: 'Connect leads', soon: true, icon: Link2 },
      { label: 'Connect placements', soon: true, icon: Link2 },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
];

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: LucideIcon }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'auto', label: 'System', icon: Monitor },
];

function isActivePath(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}

function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('auto');

  useEffect(() => {
    setTheme(readPersistedThemeMode());
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const setting = readPersistedThemeMode();
      applyThemeToDocument(resolveThemeMode(setting, media.matches));
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const onSelect = (mode: ThemeMode) => {
    setTheme(mode);
    persistThemeMode(mode);
    applyThemeToDocument(
      resolveThemeMode(mode, window.matchMedia('(prefers-color-scheme: dark)').matches),
    );
  };

  return (
    <div className={styles.themeToggle} role="group" aria-label="Theme">
      {THEME_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <Button
          key={mode}
          type="button"
          variant="bare"
          className={[styles.themeBtn, theme === mode ? styles.themeBtnActive : '']
            .filter(Boolean)
            .join(' ')}
          aria-pressed={theme === mode}
          title={label}
          onClick={() => onSelect(mode)}
        >
          <Icon size={14} aria-hidden />
          <span className={styles.themeBtnLabel}>{label}</span>
        </Button>
      ))}
    </div>
  );
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Arvilio</span>
          <span className={styles.brandProduct}>Control Plane</span>
        </div>
        <nav className={styles.nav} aria-label="Control Plane">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <div className={styles.navGroupLabel}>{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href ? isActivePath(pathname, item.href) : false;
                const className = [
                  styles.navItem,
                  item.soon ? styles.navSoon : '',
                  active ? styles.navActive : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                if (item.href && !item.soon) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={className}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={styles.navItemMain}>
                        <Icon className={styles.navIcon} size={16} aria-hidden />
                        {item.label}
                      </span>
                    </Link>
                  );
                }

                return (
                  <span key={item.label} className={className}>
                    <span className={styles.navItemMain}>
                      <Icon className={styles.navIcon} size={16} aria-hidden />
                      {item.label}
                    </span>
                    <em className={styles.soonTag}>soon</em>
                  </span>
                );
              })}
            </div>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <ThemeToggle />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
