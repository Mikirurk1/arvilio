import type { GlobalConfig } from 'payload';

/** Company umbrella brand assets — not per-product logos (those live on `products`) and not Campus School white-label. */
export const BrandKit: GlobalConfig = {
  slug: 'brand-kit',
  label: 'Brand kit',
  admin: {
    group: 'Hub',
    description:
      'Umbrella Arvilio brand for the marketing hub. Product logos/colors live on each Products document.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'logoMark',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoWordmark',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoOnDark',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ogDefaultImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Hub OG image fallback when a page/product has no ogImage. Site SEO text defaults live under Site settings → SEO.',
      },
    },
    {
      name: 'primaryColor',
      type: 'text',
      defaultValue: '#1a3a2f',
      admin: { description: 'Hex, e.g. #1a3a2f' },
    },
    {
      name: 'accentColor',
      type: 'text',
      defaultValue: '#c4a35a',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'companyLegalName',
      type: 'text',
      admin: {
        description: 'Company entity name — not Campus seller legalName',
      },
    },
    {
      name: 'supportEmail',
      type: 'email',
    },
  ],
};
