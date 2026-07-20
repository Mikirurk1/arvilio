/**
 * Seed v1 ship set (uk + en): brand-kit, products, key pages, site-settings.
 * Run: npm run seed -w @app/cms
 *
 * Env must load before payload.config (PAYLOAD_SECRET).
 */
async function seed() {
  const { loadRootEnv } = await import('../../../scripts/load-root-env.mjs');
  loadRootEnv();

  const config = (await import('../payload.config')).default;
  const { getPayload } = await import('payload');
  const payload = await getPayload({ config });

  console.log('Seeding site-settings...');
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      defaultLocale: 'en',
      enabledLocales: ['uk', 'en'],
      connectCtaEnabled: false,
      siteName: 'Arvilio',
      titleTemplate: '%s | Arvilio',
      defaultSeoDescription: 'Campus for schools. Connect for learners — coming soon.',
      robotsIndexDefault: true,
      websiteJsonLdEnabled: true,
      sitemapEnabled: true,
      twitterCardDefault: 'summary_large_image',
      publicBaseUrl:
        process.env.NEXT_PUBLIC_HUB_URL ||
        process.env.HUB_ORIGIN ||
        '',
    },
  });
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'uk',
    data: {
      siteName: 'Arvilio',
      defaultSeoDescription: 'Campus для шкіл. Connect для учнів — незабаром.',
    },
  });
  console.log('  + site-settings');

  console.log('Seeding brand-kit...');
  const ogDefaultId = await ensureDefaultOgImage(payload);
  await payload.updateGlobal({
    slug: 'brand-kit',
    data: {
      primaryColor: '#1a3a2f',
      accentColor: '#c4a35a',
      companyLegalName: 'Arvilio',
      supportEmail: 'hello@arvilio.app',
      socialLinks: [],
      ...(ogDefaultId != null ? { ogDefaultImage: ogDefaultId } : {}),
    },
  });
  console.log(ogDefaultId != null ? '  + brand-kit (with ogDefaultImage)' : '  + brand-kit');

  console.log('Seeding products...');
  for (const product of PRODUCTS) {
    await upsertProduct(payload, product);
  }

  console.log('Seeding pages...');
  for (const page of PAGES) {
    await upsertPage(payload, page);
  }

  console.log('Seeding redirects...');
  await upsertRedirects(payload);

  const users = await payload.find({ collection: 'users', limit: 1 });
  if (users.docs.length === 0) {
    const email = process.env.CMS_ADMIN_EMAIL ?? 'cms@arvilio.local';
    const password = process.env.CMS_ADMIN_PASSWORD ?? 'change-me-www-cms-admin';
    await payload.create({
      collection: 'users',
      data: { email, password, name: 'CMS Admin' },
    });
    console.log(`  + users/${email} (dev default — change password)`);
  } else {
    console.log('  - users already exist, skipping admin create');
  }

  console.log('Done.');
  console.log('Tip: also run npm run seed:campus-ui -w @app/cms for Campus chrome.');
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

const PRODUCTS = [
  {
    slug: 'campus',
    status: 'live' as const,
    sortOrder: 10,
    ctaPath: '/login',
    ctaBaseEnv: 'campus' as const,
    primaryColor: '#1a3a2f',
    accentColor: '#c4a35a',
    canonicalPath: '/campus',
    jsonLdType: 'Product' as const,
    sitemapPriority: 0.9,
    locales: {
      uk: {
        name: 'Campus',
        tagline: 'Операційна система школи',
        description:
          'Уроки, словник, практика, чат і білінг для вашої школи — в одному продукті.',
        hero: 'Campus — шкільний OS Arvilio: викладачі, учні, розклад і оплати в одному місці.',
        seoTitle: 'Arvilio Campus — шкільна платформа',
        seoDescription:
          'Запустіть школу на Campus: уроки, словник, практика, чат і білінг в одному продукті.',
        breadcrumbLabel: 'Campus',
        ctaLabel: 'Відкрити Campus',
      },
      en: {
        name: 'Campus',
        tagline: 'School operating system',
        description:
          'Lessons, vocabulary, practice, chat, and billing for your school — in one product.',
        hero: 'Campus is Arvilio’s school OS: teachers, students, schedule, and payments in one place.',
        seoTitle: 'Arvilio Campus — school platform',
        seoDescription:
          'Run your school on Campus: lessons, vocabulary, practice, chat, and billing in one product.',
        breadcrumbLabel: 'Campus',
        ctaLabel: 'Open Campus',
      },
    },
  },
  {
    slug: 'connect',
    status: 'coming_soon' as const,
    sortOrder: 20,
    ctaPath: '/',
    ctaBaseEnv: 'connect' as const,
    primaryColor: '#1e3a5f',
    accentColor: '#d4a574',
    canonicalPath: '/connect',
    jsonLdType: 'Product' as const,
    sitemapPriority: 0.6,
    locales: {
      uk: {
        name: 'Connect',
        tagline: 'Маркетплейс учнів (скоро)',
        description:
          'Платформний шар для пошуку школи чи викладача. Запуск пізніше — поки що Campus.',
        hero: 'Connect з’явиться як B2C-шар поверх Campus. Слідкуйте за оновленнями.',
        seoTitle: 'Arvilio Connect — скоро',
        seoDescription: 'Маркетплейс учнів Arvilio для пошуку школи чи викладача — у розробці.',
        breadcrumbLabel: 'Connect',
        ctaLabel: 'Скоро',
      },
      en: {
        name: 'Connect',
        tagline: 'Student marketplace (soon)',
        description:
          'Platform layer to find a school or tutor. Shipping later — Campus is live today.',
        hero: 'Connect will be the B2C layer on top of Campus. Stay tuned.',
        seoTitle: 'Arvilio Connect — coming soon',
        seoDescription:
          'Arvilio student marketplace to find a school or tutor — in development.',
        breadcrumbLabel: 'Connect',
        ctaLabel: 'Coming soon',
      },
    },
  },
];

const PAGE_SEO: Record<
  string,
  {
    canonicalPath: string;
    jsonLdType: 'WebPage' | 'none';
    sitemapPriority: number;
    breadcrumb: { en: string; uk: string };
  }
> = {
  home: {
    canonicalPath: '/',
    jsonLdType: 'WebPage',
    sitemapPriority: 1,
    breadcrumb: { en: 'Home', uk: 'Головна' },
  },
  pricing: {
    canonicalPath: '/pricing',
    jsonLdType: 'WebPage',
    sitemapPriority: 0.8,
    breadcrumb: { en: 'Pricing', uk: 'Тарифи' },
  },
  'legal-terms': {
    canonicalPath: '/legal/terms',
    jsonLdType: 'WebPage',
    sitemapPriority: 0.4,
    breadcrumb: { en: 'Terms', uk: 'Умови' },
  },
  'legal-privacy': {
    canonicalPath: '/legal/privacy',
    jsonLdType: 'WebPage',
    sitemapPriority: 0.4,
    breadcrumb: { en: 'Privacy', uk: 'Конфіденційність' },
  },
  'legal-cookies': {
    canonicalPath: '/legal/cookies',
    jsonLdType: 'WebPage',
    sitemapPriority: 0.3,
    breadcrumb: { en: 'Cookies', uk: 'Cookies' },
  },
};

const PAGES: Array<{
  slug: string;
  locales: Record<
    string,
    { title: string; body: string; seoTitle: string; seoDescription: string }
  >;
}> = [
  {
    slug: 'home',
    locales: {
      uk: {
        title: 'Arvilio',
        body: 'Екосистема для мовних шкіл: Campus сьогодні, Connect завтра. Оберіть продукт нижче.',
        seoTitle: 'Arvilio — екосистема для мовних шкіл',
        seoDescription: 'Campus для шкіл. Connect для учнів — незабаром.',
      },
      en: {
        title: 'Arvilio',
        body: 'An ecosystem for language schools: Campus today, Connect tomorrow. Pick a product below.',
        seoTitle: 'Arvilio — ecosystem for language schools',
        seoDescription: 'Campus for schools. Connect for learners — coming soon.',
      },
    },
  },
  {
    slug: 'pricing',
    locales: {
      uk: {
        title: 'Тарифи',
        body: 'Campus працює за підпискою школи. Деталі планів — у Control Plane / при онбордингу. Пакети уроків для учнів налаштовує школа всередині Campus.',
        seoTitle: 'Тарифи Arvilio',
        seoDescription: 'Підписка школи на Campus та модель Connect (пізніше).',
      },
      en: {
        title: 'Pricing',
        body: 'Campus is sold as a school subscription. Plan details live in Control Plane / onboarding. Lesson packages for learners are configured by each school inside Campus.',
        seoTitle: 'Arvilio pricing',
        seoDescription: 'School subscription for Campus and Connect model (later).',
      },
    },
  },
  {
    slug: 'legal-terms',
    locales: {
      uk: {
        title: 'Умови використання',
        body: 'Чернетка корпоративних умов Arvilio. Умови продавця уроків (оферта школи) живуть на Campus /offer.',
        seoTitle: 'Умови використання — Arvilio',
        seoDescription: 'Корпоративні умови платформи Arvilio.',
      },
      en: {
        title: 'Terms of use',
        body: 'Draft company terms for Arvilio. Per-school merchant offer terms live on Campus /offer.',
        seoTitle: 'Terms of use — Arvilio',
        seoDescription: 'Arvilio platform company terms.',
      },
    },
  },
  {
    slug: 'legal-privacy',
    locales: {
      uk: {
        title: 'Політика конфіденційності',
        body: 'Чернетка корпоративної політики конфіденційності Arvilio. Шкільні політики можуть доповнюватись у Campus.',
        seoTitle: 'Конфіденційність — Arvilio',
        seoDescription: 'Як Arvilio обробляє дані на рівні компанії.',
      },
      en: {
        title: 'Privacy policy',
        body: 'Draft company privacy policy for Arvilio. School-level policies may also apply inside Campus.',
        seoTitle: 'Privacy — Arvilio',
        seoDescription: 'How Arvilio handles data at the company layer.',
      },
    },
  },
  {
    slug: 'legal-cookies',
    locales: {
      uk: {
        title: 'Cookies',
        body: 'Ми використовуємо необхідні cookies для сесії та опційні для аналітики (за згодою).',
        seoTitle: 'Cookies — Arvilio',
        seoDescription: 'Політика cookies маркетингового сайту Arvilio.',
      },
      en: {
        title: 'Cookies',
        body: 'We use necessary cookies for session and optional analytics cookies (with consent).',
        seoTitle: 'Cookies — Arvilio',
        seoDescription: 'Cookie policy for the Arvilio marketing site.',
      },
    },
  },
];

async function ensureDefaultOgImage(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
): Promise<number | string | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'arvilio-og-default.png' } },
    limit: 1,
  });
  if (existing.docs[0]?.id != null) {
    return existing.docs[0].id as number | string;
  }

  try {
    const sharp = (await import('sharp')).default;
    const { writeFileSync, mkdirSync } = await import('fs');
    const { join } = await import('path');
    const tmpDir = join(process.cwd(), '.tmp');
    mkdirSync(tmpDir, { recursive: true });
    const filePath = join(tmpDir, 'arvilio-og-default.png');
    const svg = Buffer.from(`
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1a3a2f"/>
            <stop offset="100%" stop-color="#0f241c"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#g)"/>
        <text x="80" y="300" fill="#f5f0e6" font-family="Georgia, serif" font-size="96" font-weight="700">Arvilio</text>
        <text x="80" y="380" fill="#c4a35a" font-family="Helvetica, Arial, sans-serif" font-size="36">Campus today · Connect tomorrow</text>
      </svg>
    `);
    await sharp(svg).png().toFile(filePath);

    const created = await payload.create({
      collection: 'media',
      data: { alt: 'Arvilio — default Open Graph image' },
      filePath,
    });
    console.log('  + media/arvilio-og-default.png');
    return created.id as number | string;
  } catch (err) {
    console.warn('  ! could not seed ogDefaultImage', err);
    return null;
  }
}

async function upsertProduct(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  product: (typeof PRODUCTS)[number],
) {
  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: product.slug } },
    limit: 1,
  });

  const seoShared = {
    canonicalPath: product.canonicalPath,
    jsonLdType: product.jsonLdType,
    noIndex: false,
    noFollow: false,
    sitemapInclude: true,
    sitemapPriority: product.sitemapPriority,
    sitemapChangeFrequency: 'weekly' as const,
  };

  const base = {
    slug: product.slug,
    status: product.status,
    sortOrder: product.sortOrder,
    ctaPath: product.ctaPath,
    ctaBaseEnv: product.ctaBaseEnv,
    primaryColor: product.primaryColor,
    accentColor: product.accentColor,
    ...seoShared,
  };

  let id = existing.docs[0]?.id as string | number | undefined;
  if (!id) {
    const created = await payload.create({
      collection: 'products',
      locale: 'uk',
      data: { ...base, ...product.locales.uk },
    });
    id = created.id;
    console.log(`  + products/${product.slug} [uk]`);
  } else {
    await payload.update({
      collection: 'products',
      id,
      locale: 'uk',
      data: { ...base, ...product.locales.uk },
    });
    console.log(`  ~ products/${product.slug} [uk]`);
  }

  await payload.update({
    collection: 'products',
    id,
    locale: 'en',
    data: { ...product.locales.en, ...seoShared },
  });
  console.log(`  ~ products/${product.slug} [en]`);
}

async function upsertPage(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  page: (typeof PAGES)[number],
) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
    limit: 1,
  });

  const meta = PAGE_SEO[page.slug];
  const seoShared = meta
    ? {
        canonicalPath: meta.canonicalPath,
        jsonLdType: meta.jsonLdType,
        noIndex: false,
        noFollow: false,
        sitemapInclude: true,
        sitemapPriority: meta.sitemapPriority,
        sitemapChangeFrequency: 'monthly' as const,
      }
    : {
        noIndex: false,
        sitemapInclude: true,
        jsonLdType: 'WebPage' as const,
      };

  const uk = page.locales.uk;
  let id = existing.docs[0]?.id as string | number | undefined;
  if (!id) {
    const created = await payload.create({
      collection: 'pages',
      locale: 'uk',
      data: {
        slug: page.slug,
        title: uk.title,
        body: makeRichText(uk.body),
        seoTitle: uk.seoTitle,
        seoDescription: uk.seoDescription,
        breadcrumbLabel: meta?.breadcrumb.uk ?? uk.title,
        ...seoShared,
      },
    });
    id = created.id;
    console.log(`  + pages/${page.slug} [uk]`);
  } else {
    await payload.update({
      collection: 'pages',
      id,
      locale: 'uk',
      data: {
        title: uk.title,
        body: makeRichText(uk.body),
        seoTitle: uk.seoTitle,
        seoDescription: uk.seoDescription,
        breadcrumbLabel: meta?.breadcrumb.uk ?? uk.title,
        ...seoShared,
      },
    });
    console.log(`  ~ pages/${page.slug} [uk]`);
  }

  const en = page.locales.en;
  await payload.update({
    collection: 'pages',
    id,
    locale: 'en',
    data: {
      title: en.title,
      body: makeRichText(en.body),
      seoTitle: en.seoTitle,
      seoDescription: en.seoDescription,
      breadcrumbLabel: meta?.breadcrumb.en ?? en.title,
      ...seoShared,
    },
  });
  console.log(`  ~ pages/${page.slug} [en]`);
}

/** Common retired / mistaken Hub paths — extend in cms-admin as URLs change. */
const SEED_REDIRECTS: Array<{
  fromPath: string;
  toPath: string;
  statusCode: '301' | '302';
}> = [
  { fromPath: '/home', toPath: '/', statusCode: '301' },
  { fromPath: '/products/campus', toPath: '/campus', statusCode: '301' },
  { fromPath: '/products/connect', toPath: '/connect', statusCode: '301' },
];

async function upsertRedirects(payload: {
  find: (args: {
    collection: 'redirects';
    where: { fromPath: { equals: string } };
    limit: number;
  }) => Promise<{ docs: Array<{ id: string | number }> }>;
  create: (args: {
    collection: 'redirects';
    data: Record<string, unknown>;
  }) => Promise<unknown>;
  update: (args: {
    collection: 'redirects';
    id: string | number;
    data: Record<string, unknown>;
  }) => Promise<unknown>;
}) {
  for (const row of SEED_REDIRECTS) {
    const existing = await payload.find({
      collection: 'redirects',
      where: { fromPath: { equals: row.fromPath } },
      limit: 1,
    });
    const data = {
      fromPath: row.fromPath,
      toPath: row.toPath,
      statusCode: row.statusCode,
      enabled: true,
    };
    if (existing.docs[0]) {
      await payload.update({
        collection: 'redirects',
        id: existing.docs[0].id,
        data,
      });
      console.log(`  ~ redirects ${row.fromPath} → ${row.toPath}`);
    } else {
      await payload.create({ collection: 'redirects', data });
      console.log(`  + redirects ${row.fromPath} → ${row.toPath}`);
    }
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
