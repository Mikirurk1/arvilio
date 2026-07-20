/**
 * Seed Campus UI chrome into company CMS (uk + en).
 * Run: npm run seed:campus-ui -w @app/cms
 *
 * Writes Content (per-page) + Global chrome + nav + tours.
 */
import {
  CAMPUS_NAV_SEED,
  CAMPUS_TOUR_SEED,
  CAMPUS_UI_PAGES,
  CAMPUS_UI_STRINGS,
  campusContentPlacementFromKey,
} from '@pkg/types';

async function seedCampusUi() {
  const { loadRootEnv } = await import('../../../scripts/load-root-env.mjs');
  loadRootEnv();

  const config = (await import('../payload.config')).default;
  const { getPayload } = await import('payload');
  const payload = await getPayload({ config });

  type LocPair = { en: string; uk: string };
  const globalItems: Array<{ key: string; locales: LocPair }> = [];
  const contentItems = new Map<string, Array<{ key: string; locales: LocPair }>>();

  for (const [key, locales] of Object.entries(CAMPUS_UI_STRINGS)) {
    const place = campusContentPlacementFromKey(key);
    if (place.kind === 'global') {
      globalItems.push({ key, locales });
    } else {
      const list = contentItems.get(place.slug) ?? [];
      list.push({ key, locales });
      contentItems.set(place.slug, list);
    }
  }

  console.log('Seeding campus-global...');
  await upsertGlobal(payload, globalItems);
  console.log(`  ~ campus-global (${globalItems.length} strings)`);

  console.log('Seeding campus-global SEO...');
  await seedCampusGlobalSeo(payload);
  console.log('  ~ campus-global SEO [uk+en]');

  console.log('Seeding campus-content...');
  const pageBySlug = new Map(CAMPUS_UI_PAGES.map((p) => [p.slug, p]));
  const allSlugs = new Set([...contentItems.keys(), ...pageBySlug.keys()]);
  for (const slug of [...allSlugs].sort()) {
    await upsertContent(payload, slug, contentItems.get(slug) ?? [], pageBySlug.get(slug));
    console.log(`  ~ campus-content/${slug} (${(contentItems.get(slug) ?? []).length} strings)`);
  }

  console.log('Seeding campus-nav...');
  await payload.updateGlobal({
    slug: 'campus-nav',
    locale: 'uk',
    data: {
      sections: CAMPUS_NAV_SEED.map((section) => ({
        sectionKey: section.sectionKey,
        sectionLabel: CAMPUS_UI_STRINGS[section.sectionLabelKey]?.uk ?? section.sectionKey,
        items: section.items.map((item) => ({
          href: item.href,
          icon: item.icon,
          labelKey: item.labelKey,
          label: CAMPUS_UI_STRINGS[item.labelKey]?.uk ?? item.labelKey,
        })),
      })),
    },
  });
  await payload.updateGlobal({
    slug: 'campus-nav',
    locale: 'en',
    data: {
      sections: CAMPUS_NAV_SEED.map((section) => ({
        sectionKey: section.sectionKey,
        sectionLabel: CAMPUS_UI_STRINGS[section.sectionLabelKey]?.en ?? section.sectionKey,
        items: section.items.map((item) => ({
          href: item.href,
          icon: item.icon,
          labelKey: item.labelKey,
          label: CAMPUS_UI_STRINGS[item.labelKey]?.en ?? item.labelKey,
        })),
      })),
    },
  });
  console.log('  ~ campus-nav [uk+en]');

  console.log('Seeding campus-tours...');
  for (const tour of CAMPUS_TOUR_SEED) {
    await upsertTour(payload, tour);
  }

  console.log('Campus UI seed done.');
  process.exit(0);
}

function makeRichText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  };
}

type Payload = Awaited<ReturnType<typeof import('payload').getPayload>>;

/** Public Campus routes that should be indexable; everything else gets noIndex. */
const PUBLIC_CONTENT_SLUGS = new Set([
  'privacy',
  'legal-terms',
  'legal-payment-refund',
  'login',
  'signup',
  'forgot',
  'reset',
  'status',
]);

type ContentSeoLocales = {
  seoTitle: { en: string; uk: string };
  seoDescription: { en: string; uk: string };
  breadcrumbLabel?: { en: string; uk: string };
  canonicalPath: string;
  jsonLdType?: 'WebPage' | 'none';
};

const PUBLIC_CONTENT_SEO: Record<string, ContentSeoLocales> = {
  privacy: {
    seoTitle: {
      en: 'Privacy Policy — Arvilio Campus',
      uk: 'Політика конфіденційності — Arvilio Campus',
    },
    seoDescription: {
      en: 'How Arvilio Campus collects, uses, and protects school and learner data (GDPR).',
      uk: 'Як Arvilio Campus збирає, використовує та захищає дані школи й учнів (GDPR).',
    },
    breadcrumbLabel: { en: 'Privacy', uk: 'Конфіденційність' },
    canonicalPath: '/privacy',
    jsonLdType: 'WebPage',
  },
  'legal-terms': {
    seoTitle: {
      en: 'Terms of use — Arvilio Campus',
      uk: 'Умови використання — Arvilio Campus',
    },
    seoDescription: {
      en: 'Public offer and buyer–seller terms for prepaid language lesson credits on Campus.',
      uk: 'Публічна оферта та умови купівлі-продажу передоплачених уроків на Campus.',
    },
    breadcrumbLabel: { en: 'Terms', uk: 'Умови' },
    canonicalPath: '/legal/terms',
    jsonLdType: 'WebPage',
  },
  'legal-payment-refund': {
    seoTitle: {
      en: 'Payment & refund policy — Arvilio Campus',
      uk: 'Оплата та повернення — Arvilio Campus',
    },
    seoDescription: {
      en: 'Payment methods, delivery of lesson credits, cancellations and refunds on Campus.',
      uk: 'Способи оплати, зарахування уроків, скасування та повернення коштів на Campus.',
    },
    breadcrumbLabel: { en: 'Payment & refund', uk: 'Оплата та повернення' },
    canonicalPath: '/legal/payment-refund',
    jsonLdType: 'WebPage',
  },
  login: {
    seoTitle: {
      en: 'Sign in — Arvilio Campus',
      uk: 'Увійти — Arvilio Campus',
    },
    seoDescription: {
      en: 'Sign in to your school’s Arvilio Campus account: lessons, practice, and messages.',
      uk: 'Увійдіть до акаунта школи в Arvilio Campus: уроки, практика та повідомлення.',
    },
    breadcrumbLabel: { en: 'Sign in', uk: 'Увійти' },
    canonicalPath: '/login',
    jsonLdType: 'WebPage',
  },
  signup: {
    seoTitle: {
      en: 'Create account — Arvilio Campus',
      uk: 'Реєстрація — Arvilio Campus',
    },
    seoDescription: {
      en: 'Create your Arvilio Campus account and join your school’s language learning workspace.',
      uk: 'Створіть акаунт Arvilio Campus і приєднайтесь до робочого простору школи.',
    },
    breadcrumbLabel: { en: 'Sign up', uk: 'Реєстрація' },
    canonicalPath: '/signup',
    jsonLdType: 'WebPage',
  },
  forgot: {
    seoTitle: {
      en: 'Forgot password — Arvilio Campus',
      uk: 'Забули пароль — Arvilio Campus',
    },
    seoDescription: {
      en: 'Reset your Arvilio Campus password securely via email.',
      uk: 'Скиньте пароль Arvilio Campus безпечно через email.',
    },
    breadcrumbLabel: { en: 'Forgot password', uk: 'Забули пароль' },
    canonicalPath: '/forgot-password',
    jsonLdType: 'WebPage',
  },
  reset: {
    seoTitle: {
      en: 'Reset password — Arvilio Campus',
      uk: 'Новий пароль — Arvilio Campus',
    },
    seoDescription: {
      en: 'Choose a new password for your Arvilio Campus account.',
      uk: 'Оберіть новий пароль для акаунта Arvilio Campus.',
    },
    breadcrumbLabel: { en: 'Reset password', uk: 'Новий пароль' },
    canonicalPath: '/reset-password',
    jsonLdType: 'WebPage',
  },
  status: {
    seoTitle: {
      en: 'System status — Arvilio Campus',
      uk: 'Статус системи — Arvilio Campus',
    },
    seoDescription: {
      en: 'Current availability and status of Arvilio Campus services.',
      uk: 'Поточна доступність і статус сервісів Arvilio Campus.',
    },
    breadcrumbLabel: { en: 'Status', uk: 'Статус' },
    canonicalPath: '/status',
    jsonLdType: 'WebPage',
  },
};

async function seedCampusGlobalSeo(payload: Payload) {
  const publicBaseUrl = (process.env.NEXT_PUBLIC_CAMPUS_URL ?? '').replace(/\/$/, '');
  const shared = {
    titleTemplate: '%s | Campus',
    publicBaseUrl: publicBaseUrl || undefined,
    twitterCardDefault: 'summary_large_image' as const,
    robotsIndexDefault: true,
  };

  await payload.updateGlobal({
    slug: 'campus-global',
    locale: 'en',
    data: {
      ...shared,
      siteName: 'Arvilio Campus',
      defaultSeoDescription:
        'School platform for language lessons, vocabulary, practice, and billing — Arvilio Campus.',
    },
  });
  await payload.updateGlobal({
    slug: 'campus-global',
    locale: 'uk',
    data: {
      ...shared,
      siteName: 'Arvilio Campus',
      defaultSeoDescription:
        'Платформа для школи: уроки, словник, практика та білінг — Arvilio Campus.',
    },
  });
}

function seoPayloadForSlug(
  slug: string,
  locale: 'en' | 'uk',
  pageTitle?: string | null,
): Record<string, unknown> {
  const publicSeo = PUBLIC_CONTENT_SEO[slug];
  if (publicSeo && PUBLIC_CONTENT_SLUGS.has(slug)) {
    return {
      seoTitle: publicSeo.seoTitle[locale],
      seoDescription: publicSeo.seoDescription[locale],
      breadcrumbLabel: publicSeo.breadcrumbLabel?.[locale] ?? pageTitle ?? slug,
      canonicalPath: publicSeo.canonicalPath,
      noIndex: false,
      noFollow: false,
      sitemapInclude: true,
      sitemapPriority: slug === 'login' ? 0.3 : 0.5,
      sitemapChangeFrequency: 'yearly',
      jsonLdType: publicSeo.jsonLdType ?? 'WebPage',
    };
  }

  // Authenticated / chrome screens — keep out of search indexes
  return {
    seoTitle: pageTitle
      ? locale === 'uk'
        ? `${pageTitle} — Campus`
        : `${pageTitle} — Campus`
      : undefined,
    seoDescription: undefined,
    breadcrumbLabel: pageTitle ?? slug,
    noIndex: true,
    noFollow: true,
    sitemapInclude: false,
    jsonLdType: 'none',
  };
}

async function upsertGlobal(
  payload: Payload,
  items: Array<{ key: string; locales: { en: string; uk: string } }>,
) {
  const sorted = [...items].sort((a, b) => a.key.localeCompare(b.key));
  await payload.updateGlobal({
    slug: 'campus-global',
    locale: 'uk',
    data: {
      strings: sorted.map((item) => ({
        key: item.key,
        value: item.locales.uk,
      })),
    },
  });
  await payload.updateGlobal({
    slug: 'campus-global',
    locale: 'en',
    data: {
      strings: sorted.map((item) => ({
        key: item.key,
        value: item.locales.en,
      })),
    },
  });
}

async function upsertContent(
  payload: Payload,
  slug: string,
  items: Array<{ key: string; locales: { en: string; uk: string } }>,
  page?: (typeof CAMPUS_UI_PAGES)[number],
) {
  const existing = await payload.find({
    collection: 'campus-content',
    where: { slug: { equals: slug } },
    limit: 1,
  });

  const sorted = [...items].sort((a, b) => a.key.localeCompare(b.key));
  const ukPage = page?.locales.uk;
  const enPage = page?.locales.en;

  const ukData = {
    slug,
    title: ukPage?.title ?? slug,
    subtitle: ukPage?.subtitle ?? null,
    ...(ukPage?.body ? { body: makeRichText(ukPage.body) } : {}),
    strings: sorted.map((item) => ({
      key: item.key,
      value: item.locales.uk,
    })),
    ...seoPayloadForSlug(slug, 'uk', ukPage?.title ?? slug),
  };

  let id = existing.docs[0]?.id as string | number | undefined;
  if (!id) {
    const created = await payload.create({
      collection: 'campus-content',
      locale: 'uk',
      data: ukData,
    });
    id = created.id;
  } else {
    await payload.update({
      collection: 'campus-content',
      id,
      locale: 'uk',
      data: ukData,
    });
  }

  await payload.update({
    collection: 'campus-content',
    id,
    locale: 'en',
    data: {
      title: enPage?.title ?? slug,
      subtitle: enPage?.subtitle ?? null,
      ...(enPage?.body ? { body: makeRichText(enPage.body) } : {}),
      strings: sorted.map((item) => ({
        key: item.key,
        value: item.locales.en,
      })),
      ...seoPayloadForSlug(slug, 'en', enPage?.title ?? slug),
    },
  });
}

async function upsertTour(
  payload: Payload,
  tour: (typeof CAMPUS_TOUR_SEED)[number],
) {
  const existing = await payload.find({
    collection: 'campus-tours',
    where: { trackId: { equals: tour.trackId } },
    limit: 1,
    depth: 1,
    locale: 'uk',
  });

  type StepRow = {
    id?: string | number;
    stepId?: string;
    voice?: unknown;
  };

  const priorByStepId = new Map<string, StepRow>();
  for (const row of (existing.docs[0]?.steps as StepRow[] | undefined) ?? []) {
    if (row.stepId) priorByStepId.set(row.stepId, row);
  }

  const mapSteps = (locale: 'uk' | 'en') =>
    tour.steps.map((s) => {
      const prior = priorByStepId.get(s.stepId);
      return {
        ...(prior?.id ? { id: prior.id } : {}),
        stepId: s.stepId,
        area: s.area ?? null,
        target: s.target ?? null,
        title: s.locales[locale].title,
        body: s.locales[locale].body,
        ctaLabel: s.locales[locale].ctaLabel ?? null,
        // Keep any previously attached voice upload for this locale/step.
        ...(prior?.voice ? { voice: prior.voice } : {}),
      };
    });

  let id = existing.docs[0]?.id as string | number | undefined;
  if (!id) {
    const created = await payload.create({
      collection: 'campus-tours',
      locale: 'uk',
      data: { trackId: tour.trackId, steps: mapSteps('uk') },
    });
    id = created.id;
    console.log(`  + campus-tours/${tour.trackId} [uk]`);
  } else {
    await payload.update({
      collection: 'campus-tours',
      id,
      locale: 'uk',
      data: { steps: mapSteps('uk') },
    });
  }

  // Re-read after uk write so EN update keeps the same array row ids
  // (otherwise Payload recreates steps and drops UK locale rows).
  const afterUk = await payload.findByID({
    collection: 'campus-tours',
    id: id!,
    locale: 'uk',
    depth: 1,
  });
  priorByStepId.clear();
  for (const row of (afterUk.steps as StepRow[] | undefined) ?? []) {
    if (row.stepId) priorByStepId.set(row.stepId, row);
  }

  await payload.update({
    collection: 'campus-tours',
    id: id!,
    locale: 'en',
    data: { steps: mapSteps('en') },
  });
  console.log(`  ~ campus-tours/${tour.trackId} [uk+en] (${tour.steps.length} steps)`);
}

seedCampusUi().catch((err) => {
  console.error(err);
  process.exit(1);
});
