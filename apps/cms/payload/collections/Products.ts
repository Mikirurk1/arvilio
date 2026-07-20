import type { CollectionConfig } from 'payload';
import { documentSeoTab } from '../fields/seo';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'slug',
    group: 'Hub',
    defaultColumns: ['slug', 'status', 'sortOrder', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'e.g. campus, connect' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'coming_soon',
      options: [
        { label: 'Live', value: 'live' },
        { label: 'Coming soon', value: 'coming_soon' },
        { label: 'Hidden', value: 'hidden' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 100,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Copy',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'hero',
              type: 'textarea',
              localized: true,
              admin: { description: 'Optional longer hero copy on product landing' },
            },
            {
              name: 'ctaLabel',
              type: 'text',
              localized: true,
            },
            {
              name: 'ctaPath',
              type: 'text',
              defaultValue: '/',
              admin: { description: 'Path on product host, e.g. /signup or /login' },
            },
            {
              name: 'ctaBaseEnv',
              type: 'select',
              required: true,
              defaultValue: 'campus',
              options: [
                { label: 'Campus (NEXT_PUBLIC_CAMPUS_URL)', value: 'campus' },
                { label: 'Connect (NEXT_PUBLIC_CONNECT_URL)', value: 'connect' },
                { label: 'Custom base URL', value: 'custom' },
              ],
            },
            {
              name: 'ctaCustomBase',
              type: 'text',
              admin: {
                condition: (_, siblingData) => siblingData?.ctaBaseEnv === 'custom',
                description: 'Used when ctaBaseEnv is custom',
              },
            },
          ],
        },
        {
          label: 'Brand',
          description:
            'Product-owned brand — not the company umbrella (Brand kit). Same theme DNA, own logo/colors.',
          fields: [
            {
              name: 'icon',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Small mark for home product cards (optional)',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Primary product logo (light backgrounds)' },
            },
            {
              name: 'logoOnDark',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Product logo for dark backgrounds' },
            },
            {
              name: 'primaryColor',
              type: 'text',
              admin: { description: 'Hex, e.g. #1a3a2f — tints the product landing' },
            },
            {
              name: 'accentColor',
              type: 'text',
              admin: { description: 'Hex accent for CTAs / highlights' },
            },
          ],
        },
        documentSeoTab,
      ],
    },
  ],
};
