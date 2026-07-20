import type { NavItem } from '../../components/layout/sidebar-nav';

const HREF_LABEL_KEY: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/lessons': 'nav.lessons',
  '/practice': 'nav.practice',
  '/materials': 'nav.materials',
  '/calendar': 'nav.calendar',
  '/chat': 'nav.chat',
  '/students': 'nav.students',
  '/staff': 'nav.staff',
  '/payment': 'nav.payment',
  '/finance': 'nav.finance',
  '/billing': 'nav.billing',
  '/profile': 'nav.profile',
  '/admin': 'nav.admin',
  '/system': 'nav.system',
};

const SECTION_LABEL_KEY: Record<string, string> = {
  Learn: 'nav.section.learn',
  Schedule: 'nav.section.schedule',
  Connect: 'nav.section.connect',
  Account: 'nav.section.account',
  Platform: 'nav.section.platform',
  learn: 'nav.section.learn',
  schedule: 'nav.section.schedule',
  connect: 'nav.section.connect',
  account: 'nav.section.account',
  platform: 'nav.section.platform',
};

export function navItemLabelKey(href: string): string | undefined {
  return HREF_LABEL_KEY[href];
}

export function navSectionLabelKey(section: string): string | undefined {
  return SECTION_LABEL_KEY[section];
}

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export function localizeNavItem(
  item: NavItem,
  t: TranslateFn,
  studentsLabelKey?: string,
): NavItem {
  const key =
    item.href === '/students' && studentsLabelKey
      ? studentsLabelKey
      : navItemLabelKey(item.href);
  if (!key) return item;
  return { ...item, label: t(key) };
}
