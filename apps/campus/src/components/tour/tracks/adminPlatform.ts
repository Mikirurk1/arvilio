import type { TourStep } from './types';

/** Short track stub for docs/CMS (`admin_platform`). Campus maps `super_admin` → full `admin` tour. */
export const ADMIN_PLATFORM_TOUR_STEPS: TourStep[] = [
  {
    id: 'sup-welcome',
    title: 'Platform operator in school view',
    body: "You're in a school workspace with elevated access. Day-to-day school ops match the admin map; cross-school actions belong in the platform console.",
    pose: 'greet',
    uaIntent: 'Короткий тур для super_admin у школі',
  },
  {
    id: 'sup-system',
    title: 'System',
    body: 'School integrations and branding live here. Prefer the platform app for schools list, suspend, and audit.',
    area: 'System',
    navHref: '/system',
    pose: 'point',
    uaIntent: 'System школи',
  },
  {
    id: 'sup-billing',
    title: 'Subscription',
    body: "This school's SaaS plan and quotas.",
    area: 'Subscription',
    navHref: '/billing',
    pose: 'point',
    uaIntent: 'Підписка школи',
  },
  {
    id: 'sup-done',
    title: 'Done',
    body: 'Use the platform app for fleet-wide work. Replay this short tour from Profile → Account if needed.',
    pose: 'celebrate',
    uaIntent: 'Фініш',
  },
];
