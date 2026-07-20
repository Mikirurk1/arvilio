'use client';

import { CAMPUS_NAV_SEED, CAMPUS_UI_STRINGS } from '@pkg/types';
import { useEffect, useState } from 'react';
import type { NavItem } from '../../components/layout/sidebar-nav';
import { useCampusI18n } from './useCampusI18n';
import type { CampusNavSection } from './campus-cms';

function seedSections(locale: 'uk' | 'en'): CampusNavSection[] {
  return CAMPUS_NAV_SEED.map((section) => ({
    sectionKey: section.sectionKey,
    sectionLabel:
      CAMPUS_UI_STRINGS[section.sectionLabelKey]?.[locale] ??
      CAMPUS_UI_STRINGS[section.sectionLabelKey]?.en ??
      section.sectionKey,
    items: section.items.map((item) => ({
      href: item.href,
      icon: item.icon,
      labelKey: item.labelKey,
      label:
        CAMPUS_UI_STRINGS[item.labelKey]?.[locale] ??
        CAMPUS_UI_STRINGS[item.labelKey]?.en ??
        item.labelKey,
    })),
  }));
}

export type VisibleNavSection = {
  sectionKey: string;
  section: string;
  items: NavItem[];
};

/** Nav structure from Payload campus-nav (seed fallback). Labels prefer campus-strings via t(). */
export function useCampusNavSections(): CampusNavSection[] {
  const { locale } = useCampusI18n();
  const [sections, setSections] = useState<CampusNavSection[]>(() =>
    seedSections(locale === 'uk' ? 'uk' : 'en'),
  );

  useEffect(() => {
    let cancelled = false;
    const loc = locale === 'uk' ? 'uk' : 'en';
    setSections(seedSections(loc));
    const url = new URL('/cms-proxy/nav', window.location.origin);
    url.searchParams.set('locale', loc);
    void fetch(url.toString(), { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { sections?: CampusNavSection[] } | null) => {
        if (cancelled || !data?.sections?.length) return;
        setSections(data.sections);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return sections;
}

export function mapCampusNavToItems(sections: CampusNavSection[]): Array<{
  sectionKey: string;
  section: string;
  items: NavItem[];
}> {
  return sections.map((section) => ({
    sectionKey: section.sectionKey,
    section: section.sectionLabel,
    items: (section.items ?? []).map((item) => ({
      href: item.href,
      label: item.label,
      icon: item.icon,
    })),
  }));
}
