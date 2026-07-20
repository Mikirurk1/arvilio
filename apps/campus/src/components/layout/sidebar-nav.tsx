'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, type ComponentType } from 'react';
import {
  BookOpen,
  Calendar,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  MessageCircle,
  Receipt,
  Settings,
  ShieldCheck,
  Target,
  User,
  UserCog,
  Users,
  Wallet,
  type LucideProps,
} from 'lucide-react';
import { Tooltip } from '../ui';
import {
  useActiveRoleKey,
} from '../../lib/active-user';
import { useChatNavBadge } from '../../hooks/use-chat-nav-badge';
import { usePracticeNavBadge } from '../../hooks/use-practice-nav-badge';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import { canRoleAccessPathname } from '../../lib/auth/route-policy';
import { stripLocalePrefix } from '@pkg/types';
import { mapCampusNavToItems, useCampusNavSections, useCampusT } from '../../lib/cms';
import { localizeNavItem, navSectionLabelKey } from '../../lib/cms/nav-i18n';
import styles from './Sidebar.module.scss';

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: 'green';
};

/**
 * Legacy hardcoded nav (labels only). Structure SoT is Payload `campus-nav`
 * via `useCampusNavSections` / `CAMPUS_NAV_SEED`. Kept for reference & tests.
 */
export const navSections = [
  {
    section: 'Learn',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { href: '/lessons', label: 'Lessons', icon: 'lessons' },
      { href: '/practice', label: 'Practice', icon: 'practice' },
      { href: '/materials', label: 'Materials', icon: 'materials' },
    ] as NavItem[],
  },
  {
    section: 'Schedule',
    items: [{ href: '/calendar', label: 'Calendar', icon: 'calendar' }] as NavItem[],
  },
  {
    section: 'Connect',
    items: [
      { href: '/chat', label: 'Chat', icon: 'chat' },
      { href: '/students', label: 'Students', icon: 'students' },
      { href: '/staff', label: 'Staff', icon: 'staff' },
    ] as NavItem[],
  },
  {
    section: 'Account',
    items: [
      { href: '/payment', label: 'Payment', icon: 'payment' },
      { href: '/finance', label: 'Finance', icon: 'finance' },
      { href: '/billing', label: 'Subscription', icon: 'billing' },
      { href: '/profile', label: 'Profile & Settings', icon: 'profile' },
    ] as NavItem[],
  },
  {
    section: 'Platform',
    items: [
      { href: '/admin', label: 'Admin', icon: 'admin' },
      { href: '/system', label: 'System', icon: 'system' },
    ] as NavItem[],
  },
];

type NavIconComponent = ComponentType<LucideProps>;

export const navIcons: Record<string, NavIconComponent> = {
  grid: LayoutDashboard,
  practice: Target,
  chat: MessageCircle,
  lessons: BookOpen,
  materials: FolderOpen,
  calendar: Calendar,
  students: Users,
  staff: UserCog,
  payment: CreditCard,
  finance: Wallet,
  billing: Receipt,
  admin: ShieldCheck,
  system: Settings,
  profile: User,
};

function NavIcon({ name }: { name: string }) {
  const Icon = navIcons[name] ?? LayoutDashboard;
  return <Icon className={styles.iconSvg} size={18} strokeWidth={2} aria-hidden />;
}

export function useVisibleNavSections() {
  const practiceTotal = usePracticeNavBadge();
  const chatUnread = useChatNavBadge();
  const roleKey = useActiveRoleKey();
  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();
  const t = useCampusT();
  const cmsSections = useCampusNavSections();
  const baseSections = mapCampusNavToItems(cmsSections);

  return baseSections
    .map((section) => ({
      sectionKey: section.sectionKey,
      section: t(navSectionLabelKey(section.sectionKey) ?? navSectionLabelKey(section.section) ?? section.sectionKey) || section.section,
      items: section.items
        .filter((item) => canRoleAccessPathname(item.href, roleKey))
        .map((item) => {
          const studentsKey = groupLessonsEnabled ? 'nav.studentsGroups' : 'nav.students';
          const localized = localizeNavItem(item, t, studentsKey);
          if (item.href === '/practice' && practiceTotal > 0) {
            return { ...localized, badge: String(practiceTotal), badgeColor: 'green' as const };
          }
          if (item.href === '/chat' && chatUnread > 0) {
            return { ...localized, badge: String(chatUnread), badgeColor: 'green' as const };
          }
          return localized;
        }),
    }))
    .filter((section) => section.items.length > 0);
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
  const pathname = stripLocalePrefix(usePathname() || '/').pathname;
  const visibleNavItems = useVisibleNavSections();
  const t = useCampusT();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isDrawer = variant === 'drawer';
  const showCollapsed = isDrawer ? false : collapsed;

  const hoveredItem = hoveredHref
    ? visibleNavItems.flatMap((s) => s.items).find((i) => i.href === hoveredHref)
    : undefined;
  const hoveredEl = hoveredHref ? rowRefs.current.get(hoveredHref) ?? null : null;
  const showTip = showCollapsed && hoveredHref && hoveredItem;

  return (
    <>
      <nav className={styles.nav} aria-label={t('nav.aria.main')}>
        {visibleNavItems.map(({ section, sectionKey, items }) => (
          <div key={sectionKey} className={styles.section}>
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
                    data-tour-nav={href}
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
                      <span className={styles.icon}>
                        <NavIcon name={icon} />
                      </span>
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
