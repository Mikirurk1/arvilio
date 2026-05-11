'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button, Tooltip } from '../ui';
import { activeMockUser, isTeacherAdminOrSuper, mockPracticeActivities } from '../../mocks';
import styles from './Sidebar.module.scss';

const STORAGE_KEY = 'soenglish.sidebarCollapsed';

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: 'green';
};

const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { href: '/practice', label: 'Practice', icon: 'practice' },
    ] as NavItem[],
  },
  {
    section: 'Schedule',
    items: [
      { href: '/lessons', label: 'Lessons', icon: 'lessons' },
      { href: '/calendar', label: 'Calendar', icon: 'calendar' },
      { href: '/students', label: 'Students', icon: 'students' },
    ] as NavItem[],
  },
  {
    section: 'Account',
    items: [{ href: '/profile', label: 'Profile & Settings', icon: 'profile' }] as NavItem[],
  },
];

const icons: Record<string, React.ReactNode> = {
  practice: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect
        x="10"
        y="2"
        width="6"
        height="6"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="2"
        y="10"
        width="6"
        height="6"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="10"
        y="10"
        width="6"
        height="6"
        rx="1.5"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 18 18" fill="none">
      <path
        d="M9 3C7 3 5 3.5 4 4.5V14.5C5 13.5 7 13 9 13s4 .5 5 1.5V4.5C13 3.5 11 3 9 3z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M9 3v10" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="9" cy="13" r="0.7" fill="currentColor" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect
        x="2.5"
        y="3.5"
        width="13"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.5 7.5h13M6 2v3M12 2v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 15c0-2.76 2.69-5 6-5s6 2.24 6 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  students: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="6" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.8 14c0-2 1.7-3.6 3.8-3.6h0.8c2.1 0 3.8 1.6 3.8 3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 14c0-1.5 1.2-2.7 2.8-2.7h0.4c1.5 0 2.8 1.2 2.8 2.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  lessons: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="3" width="13" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 6.5h6M6 9h6M6 11.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

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
      <path
        d="M4.5 3.5v11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
      <path
        d="M13.5 3.5v11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function findNavItem(href: string) {
  for (const { items } of navItems) {
    const item = items.find((i) => i.href === href);
    if (item) return item;
  }
  return undefined;
}

export default function Sidebar() {
  const practiceTotal = mockPracticeActivities.reduce((sum, activity) => {
    if (!activity.stat) return sum;
    const match = activity.stat.match(/\d+/);
    return sum + (match ? Number(match[0]) : 0);
  }, 0);

  const canSeeStudents = isTeacherAdminOrSuper(activeMockUser.role);
  const visibleNavItems = navItems.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => (item.href === '/students' ? canSeeStudents : true))
      .map((item) =>
        item.href === '/practice' ? { ...item, badge: String(practiceTotal), badgeColor: 'green' as const } : item,
      ),
  }));

  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    try {
      if (
        typeof window !== 'undefined' &&
        localStorage.getItem(STORAGE_KEY) === '1'
      ) {
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-w',
      collapsed ? '72px' : '240px',
    );
    document.documentElement.setAttribute(
      'data-sidebar-collapsed',
      collapsed ? 'true' : 'false',
    );
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--sidebar-w');
      document.documentElement.removeAttribute('data-sidebar-collapsed');
    };
  }, []);

  useEffect(() => {
    if (!collapsed) setHoveredHref(null);
  }, [collapsed]);

  const hoveredItem = hoveredHref ? findNavItem(hoveredHref) : undefined;
  const hoveredEl = hoveredHref ? rowRefs.current.get(hoveredHref) ?? null : null;
  const showTip =
    collapsed &&
    hoveredHref &&
    hoveredItem &&
    typeof document !== 'undefined';

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <nav className={styles.nav}>
        {visibleNavItems.map(({ section, items }) => (
          <div key={section} className={styles.section}>
            <div className={styles.sectionTitle}>{section}</div>
            {items.map(({ href, label, icon, badge, badgeColor }) => {
              const active =
                pathname === href ||
                (href !== '/' && pathname.startsWith(href));
              return (
                <div
                  key={href}
                  className={styles.itemRow}
                  ref={(el) => {
                    if (el) rowRefs.current.set(href, el);
                    else rowRefs.current.delete(href);
                  }}
                  onMouseEnter={() => {
                    if (collapsed) setHoveredHref(href);
                  }}
                  onMouseLeave={() => {
                    if (collapsed) setHoveredHref(null);
                  }}
                >
                  <Link
                    href={href}
                    className={`${styles.item} ${active ? styles.active : ''}`}
                    aria-current={active ? 'page' : undefined}
                    aria-label={collapsed ? label : undefined}
                    onFocus={() => {
                      if (collapsed) setHoveredHref(href);
                    }}
                    onBlur={() => {
                      if (collapsed) setHoveredHref(null);
                    }}
                  >
                    <span className={styles.iconWrap}>
                      <span className={styles.icon}>{icons[icon]}</span>
                      {collapsed && badge ? (
                        <span className={styles.badgeDot} />
                      ) : null}
                    </span>
                    <span className={styles.itemLabel}>{label}</span>
                    {!collapsed && badge ? (
                      <span
                        className={`${styles.badge} ${badgeColor === 'green' ? styles.badgeGreen : ''}`}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className={styles.toolbar}>
        <Button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <CollapseIcon expanded={!collapsed} />
        </Button>
      </div>

      <Tooltip
        open={Boolean(showTip)}
        targetEl={hoveredEl}
        placement="right"
        className={styles.flyoutPortal}
        content={
          hoveredItem ? (
            <>
              {hoveredItem.label}
              {hoveredItem.badge ? (
                <span
                  className={`${styles.flyoutBadge} ${hoveredItem.badgeColor === 'green' ? styles.flyoutBadgeGreen : ''}`}
                >
                  {hoveredItem.badge}
                </span>
              ) : null}
            </>
          ) : null
        }
      />
    </aside>
  );
}
