import type { Field, Tab } from 'payload';

/**
 * Document-level SEO (pages, products, campus-content public screens).
 * Fallback chain in apps: doc → site/product defaults → brand-kit.ogDefaultImage.
 *
 * Soft SERP limits — Google truncates around these lengths; maxLength guides editors.
 * Skipped `@payloadcms/plugin-seo`: our custom fields already cover the catalog; plugin would duplicate schema.
 */
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

const SEO_EDITOR_CHECKLIST =
  'Checklist: unique title ≤60 chars · description ≤160 · OG image 1200×630 · set noIndex for private screens · keep canonicalPath only when the URL differs from the route.';

export const documentSeoFields: Field[] = [
  {
    name: 'seoTitle',
    type: 'text',
    localized: true,
    maxLength: SEO_TITLE_MAX,
    admin: {
      description: `HTML / OG title (aim ≤${SEO_TITLE_MAX} chars before the site title template). Falls back to document title/name.`,
    },
  },
  {
    name: 'seoDescription',
    type: 'textarea',
    localized: true,
    maxLength: SEO_DESCRIPTION_MAX,
    admin: {
      description: `Meta / OG description (aim ≤${SEO_DESCRIPTION_MAX} chars; Google often shows ~150–160).`,
    },
  },
  {
    name: 'ogImage',
    type: 'upload',
    relationTo: 'media',
    admin: {
      description: 'Open Graph image (ideal 1200×630). Falls back to Brand kit / Campus Global ogDefaultImage.',
    },
  },
  {
    name: 'twitterImage',
    type: 'upload',
    relationTo: 'media',
    admin: {
      description: 'Optional Twitter image; falls back to ogImage.',
    },
  },
  {
    name: 'canonicalPath',
    type: 'text',
    admin: {
      description:
        'Optional path override for canonical URL (e.g. /pricing). Empty = derive from route.',
    },
  },
  {
    name: 'breadcrumbLabel',
    type: 'text',
    localized: true,
    admin: {
      description: 'Breadcrumb / JSON-LD name (Hub BreadcrumbList + document name). Falls back to seoTitle / title.',
    },
  },
  {
    name: 'noIndex',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description: 'If set, emit robots noindex for this document.',
    },
  },
  {
    name: 'noFollow',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description: 'If set, emit robots nofollow for this document.',
    },
  },
  {
    name: 'sitemapInclude',
    type: 'checkbox',
    defaultValue: true,
    admin: {
      description: 'Include in sitemap.xml when true and not noIndex.',
    },
  },
  {
    name: 'sitemapPriority',
    type: 'number',
    min: 0,
    max: 1,
    admin: {
      description: 'Sitemap priority 0–1 (optional).',
      step: 0.1,
    },
  },
  {
    name: 'sitemapChangeFrequency',
    type: 'select',
    options: [
      { label: 'Always', value: 'always' },
      { label: 'Hourly', value: 'hourly' },
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' },
      { label: 'Never', value: 'never' },
    ],
    admin: { description: 'Optional sitemap changefreq.' },
  },
  {
    name: 'jsonLdType',
    type: 'select',
    defaultValue: 'none',
    options: [
      { label: 'None', value: 'none' },
      { label: 'WebPage', value: 'WebPage' },
      { label: 'Product', value: 'Product' },
      { label: 'FAQPage', value: 'FAQPage' },
      { label: 'Article', value: 'Article' },
    ],
    admin: {
      description: 'Structured data type emitted by Hub/Campus when supported.',
    },
  },
];

/** FAQ items — used on Hub pages when jsonLdType is FAQPage. */
export const pageFaqFields: Field[] = [
  {
    name: 'faqItems',
    type: 'array',
    labels: { singular: 'FAQ item', plural: 'FAQ items' },
    admin: {
      condition: (_, siblingData) => siblingData?.jsonLdType === 'FAQPage',
      description: 'Emitted as FAQPage JSON-LD when jsonLdType is FAQPage.',
    },
    fields: [
      {
        name: 'question',
        type: 'text',
        required: true,
        localized: true,
      },
      {
        name: 'answer',
        type: 'textarea',
        required: true,
        localized: true,
      },
    ],
  },
];

/** Collapsible block for collections that keep SEO under the main form. */
export const documentSeoCollapsible: Field = {
  type: 'collapsible',
  label: 'SEO',
  admin: { initCollapsed: false, description: SEO_EDITOR_CHECKLIST },
  fields: documentSeoFields,
};

/** Pages: document SEO + FAQ blocks. */
export const pagesSeoCollapsible: Field = {
  type: 'collapsible',
  label: 'SEO',
  admin: { initCollapsed: false, description: SEO_EDITOR_CHECKLIST },
  fields: [...documentSeoFields, ...pageFaqFields],
};

/** Tab variant for collections that already use tabs (e.g. products). */
export const documentSeoTab: Tab = {
  label: 'SEO',
  description: `Search / social metadata for this document only. ${SEO_EDITOR_CHECKLIST}`,
  fields: documentSeoFields,
};

/** Hub Site settings — defaults for the marketing site. */
export const hubSiteSeoFields: Field[] = [
  {
    name: 'siteName',
    type: 'text',
    localized: true,
    defaultValue: 'Arvilio',
    admin: {
      description: 'Site name for titles and JSON-LD Organization/WebSite name',
    },
  },
  {
    name: 'titleTemplate',
    type: 'text',
    defaultValue: '%s | Arvilio',
    admin: {
      description: 'Next.js title template. Use %s for the page title.',
    },
  },
  {
    name: 'defaultSeoDescription',
    type: 'textarea',
    localized: true,
    maxLength: SEO_DESCRIPTION_MAX,
    admin: {
      description: `Fallback meta description when a page/product has none (aim ≤${SEO_DESCRIPTION_MAX} chars).`,
    },
  },
  {
    name: 'publicBaseUrl',
    type: 'text',
    admin: {
      description:
        'Absolute origin for canonical/sitemap/JSON-LD (e.g. https://arvilio.app). Falls back to NEXT_PUBLIC_HUB_URL.',
    },
  },
  {
    name: 'twitterHandle',
    type: 'text',
    admin: {
      description: 'Twitter/X site handle without @, e.g. arvilio',
    },
  },
  {
    name: 'twitterCardDefault',
    type: 'select',
    defaultValue: 'summary_large_image',
    options: [
      { label: 'Summary', value: 'summary' },
      { label: 'Summary large image', value: 'summary_large_image' },
    ],
  },
  {
    name: 'facebookAppId',
    type: 'text',
    admin: { description: 'Optional Meta/Facebook App ID for OG debugger.' },
  },
  {
    name: 'robotsIndexDefault',
    type: 'checkbox',
    defaultValue: true,
    admin: {
      description: 'Default robots index for Hub pages (document noIndex overrides).',
    },
  },
  {
    name: 'googleSiteVerification',
    type: 'text',
    admin: {
      description: 'Google Search Console verification token (content=… only).',
    },
  },
  {
    name: 'bingSiteVerification',
    type: 'text',
    admin: {
      description: 'Bing Webmaster verification token.',
    },
  },
  {
    name: 'websiteJsonLdEnabled',
    type: 'checkbox',
    defaultValue: true,
    admin: {
      description: 'Emit Organization + WebSite JSON-LD on Hub. Uses Brand kit legal name + socialLinks.',
    },
  },
  {
    name: 'searchActionUrl',
    type: 'text',
    admin: {
      description: 'Optional WebSite SearchAction target URL template (with {search_term_string}).',
      condition: (_, siblingData) => siblingData?.websiteJsonLdEnabled !== false,
    },
  },
  {
    name: 'sitemapEnabled',
    type: 'checkbox',
    defaultValue: true,
    admin: { description: 'When false, Hub sitemap.xml returns empty / robots omits Sitemap line.' },
  },
  {
    name: 'robotsDisallow',
    type: 'array',
    labels: { singular: 'Disallow path', plural: 'robots.txt disallow' },
    admin: { description: 'Paths listed under User-agent: * Disallow:' },
    fields: [
      {
        name: 'path',
        type: 'text',
        required: true,
        admin: { description: 'e.g. /api/ or /draft' },
      },
    ],
  },
  {
    name: 'robotsTxtExtra',
    type: 'textarea',
    admin: {
      description: 'Optional extra lines appended to robots.txt (advanced).',
    },
  },
];

/** Campus Global — defaults for public Campus routes (privacy, legal, auth landing). */
export const campusSiteSeoFields: Field[] = [
  {
    name: 'siteName',
    type: 'text',
    localized: true,
    defaultValue: 'Arvilio Campus',
    admin: {
      description: 'Default <title> / OG site name for Campus public pages.',
    },
  },
  {
    name: 'titleTemplate',
    type: 'text',
    defaultValue: '%s | Campus',
    admin: { description: 'Title template for Campus public metadata.' },
  },
  {
    name: 'defaultSeoDescription',
    type: 'textarea',
    localized: true,
    maxLength: SEO_DESCRIPTION_MAX,
    admin: {
      description: `Fallback description when a Content doc has no SEO description (aim ≤${SEO_DESCRIPTION_MAX} chars).`,
    },
  },
  {
    name: 'publicBaseUrl',
    type: 'text',
    admin: {
      description:
        'Absolute Campus origin for canonical (e.g. https://campus.arvilio.app). Falls back to NEXT_PUBLIC_CAMPUS_URL.',
    },
  },
  {
    name: 'ogDefaultImage',
    type: 'upload',
    relationTo: 'media',
    admin: {
      description: 'Default OG image for Campus public pages (not school white-label).',
    },
  },
  {
    name: 'twitterHandle',
    type: 'text',
    admin: { description: 'Optional X/Twitter handle without @' },
  },
  {
    name: 'twitterCardDefault',
    type: 'select',
    defaultValue: 'summary_large_image',
    options: [
      { label: 'Summary', value: 'summary' },
      { label: 'Summary large image', value: 'summary_large_image' },
    ],
  },
  {
    name: 'robotsIndexDefault',
    type: 'checkbox',
    defaultValue: true,
    admin: {
      description: 'Default robots index for Campus public pages.',
    },
  },
  {
    name: 'googleSiteVerification',
    type: 'text',
    admin: {
      description: 'Google Search Console token for the Campus domain.',
    },
  },
  {
    name: 'bingSiteVerification',
    type: 'text',
    admin: {
      description: 'Bing Webmaster token for the Campus domain.',
    },
  },
];
