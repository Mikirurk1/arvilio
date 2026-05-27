'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { Tooltip } from '../ui';
import {
  useActiveRoleKey,
} from '../../lib/active-user';
import { useChatNavBadge } from '../../hooks/use-chat-nav-badge';
import { usePracticeNavBadge } from '../../hooks/use-practice-nav-badge';
import { canRoleAccessPathname } from '../../lib/auth/route-policy';
import styles from './Sidebar.module.scss';

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: 'green';
};

export const navSections = [
  {
    section: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { href: '/practice', label: 'Practice', icon: 'practice' },
      { href: '/chat', label: 'Chat', icon: 'chat' },
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
    items: [
      { href: '/payment', label: 'Payment', icon: 'payment' },
      { href: '/admin', label: 'Admin', icon: 'admin' },
      { href: '/system', label: 'System', icon: 'system' },
      { href: '/profile', label: 'Profile & Settings', icon: 'profile' },
    ] as NavItem[],
  },
];

export const navIcons: Record<string, React.ReactNode> = {
  practice: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 18 18" fill="none">
      <path
        d="M3 4.5h12a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H7l-3 2.5V6a1.5 1.5 0 0 1 1.5-1.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="3.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
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
      <path
        d="M2.8 14c0-2 1.7-3.6 3.8-3.6h0.8c2.1 0 3.8 1.6 3.8 3.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M10 14c0-1.5 1.2-2.7 2.8-2.7h0.4c1.5 0 2.8 1.2 2.8 2.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  lessons: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="3" width="13" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 6.5h6M6 9h6M6 11.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  payment: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 7.5h14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 18 18" fill="none">
      <path
        d="M9 2l5.5 2v4.2c0 3.4-2.3 6.2-5.5 7.3-3.2-1.1-5.5-3.9-5.5-7.3V4L9 2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 9.2l1.7 1.7L11.7 7.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M13.6 4.4l-1.4 1.4M5.8 12.2l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function findNavItem(href: string) {
  for (const { items } of navSections) {
    const item = items.find((i) => i.href === href);
    if (item) return item;
  }
  return undefined;
}

export function useVisibleNavSections() {
  const practiceTotal = usePracticeNavBadge();
  const chatUnread = useChatNavBadge();
  const roleKey = useActiveRoleKey();

  return navSections.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => canRoleAccessPathname(item.href, roleKey))
      .map((item) => {
        if (item.href === '/practice' && practiceTotal > 0) {
          return { ...item, badge: String(practiceTotal), badgeColor: 'green' as const };
        }
        if (item.href === '/chat' && chatUnread > 0) {
          return { ...item, badge: String(chatUnread), badgeColor: 'green' as const };
        }
        return item;
      }),
  }));
}

export function SidebarNav({
  collapsed = false,
  variant = 'rail',
  onNavigate,
}: {
  collapsed?: boolean;
  variant?: 'rail' | 'drawer';
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visibleNavItems = useVisibleNavSections();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isDrawer = variant === 'drawer';
  const showCollapsed = isDrawer ? false : collapsed;

  const hoveredItem = hoveredHref ? findNavItem(hoveredHref) : undefined;
  const hoveredEl = hoveredHref ? rowRefs.current.get(hoveredHref) ?? null : null;
  const showTip = showCollapsed && hoveredHref && hoveredItem;

  return (
    <>
      <nav className={styles.nav} aria-label="Main navigation">
        {visibleNavItems.map(({ section, items }) => (
          <div key={section} className={styles.section}>
            <div className={styles.sectionTitle}>{section}</div>
            {items.map(({ href, label, icon, badge, badgeColor }) => {
              const active =
                pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <div
                  key={href}
                  className={styles.itemRow}
                  ref={(el) => {
                    if (el) rowRefs.current.set(href, el);
                    else rowRefs.current.delete(href);
                  }}
                  onMouseEnter={() => {
                    if (showCollapsed) setHoveredHref(href);
                  }}
                  onMouseLeave={() => {
                    if (showCollapsed) setHoveredHref(null);
                  }}
                >
                  <Link
                    href={href}
                    className={`${styles.item} ${active ? styles.active : ''} ${isDrawer ? styles.itemDrawer : ''}`}
                    aria-current={active ? 'page' : undefined}
                    aria-label={showCollapsed ? label : undefined}
                    onClick={onNavigate}
                    onFocus={() => {
                      if (showCollapsed) setHoveredHref(href);
                    }}
                    onBlur={() => {
                      if (showCollapsed) setHoveredHref(null);
                    }}
                  >
                    <span className={styles.iconWrap}>
                      <span className={styles.icon}>{navIcons[icon]}</span>
                      {showCollapsed && badge ? <span className={styles.badgeDot} /> : null}
                    </span>
                    <span className={styles.itemLabel}>{label}</span>
                    {!showCollapsed && badge ? (
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

      {!isDrawer ? (
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
      ) : null}
    </>
  );
}
