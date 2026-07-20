import type { GlobalConfig } from 'payload';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@pkg/types';
import { hubSiteSeoFields } from '../fields/seo';

const localeOptions = SUPPORTED_LOCALES.map((code) => ({
  label: code.toUpperCase(),
  value: code,
}));

/**
 * Publish set for marketing URLs + Hub SEO defaults.
 * Each locale code must be ∈ Platform SUPPORTED_LOCALES.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Hub',
    description: 'Locales, feature flags, and Hub-wide SEO defaults.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Locales',
          fields: [
            {
              name: 'defaultLocale',
              type: 'select',
              required: true,
              defaultValue: DEFAULT_LOCALE,
              options: localeOptions,
              admin: { description: 'Must be one of enabledLocales' },
            },
            {
              name: 'enabledLocales',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: [...SUPPORTED_LOCALES],
              options: localeOptions,
              admin: {
                description:
                  'Published UI locales ⊆ Platform SUPPORTED_LOCALES. v1 ship set: uk, en.',
              },
            },
            {
              name: 'connectCtaEnabled',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Soft flag until Connect ships (Phase E)' },
            },
          ],
        },
        {
          label: 'SEO',
          description:
            'Defaults for the Hub marketing site. Per-page/product overrides live on those documents. OG image fallback stays on Brand kit.',
          fields: hubSiteSeoFields,
        },
      ],
    },
  ],
};
