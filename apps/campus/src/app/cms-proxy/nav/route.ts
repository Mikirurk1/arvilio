import { NextRequest, NextResponse } from 'next/server';
import { CAMPUS_NAV_SEED, CAMPUS_UI_STRINGS } from '@pkg/types';
import { getCampusNav, normalizeCampusLocale } from '../../../lib/cms/campus-cms';

export async function GET(request: NextRequest) {
  const locale = normalizeCampusLocale(request.nextUrl.searchParams.get('locale'));
  const sections = await getCampusNav(locale);
  if (sections.length > 0) {
    return NextResponse.json({ sections });
  }
  const fallback = CAMPUS_NAV_SEED.map((section) => ({
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
  return NextResponse.json({ sections: fallback });
}
