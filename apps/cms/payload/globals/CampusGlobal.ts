import type { GlobalConfig } from 'payload';
import { campusSiteSeoFields } from '../fields/seo';

/** Shared Campus chrome strings + public SEO defaults. */
export const CampusGlobal: GlobalConfig = {
  slug: 'campus-global',
  label: 'Global',
  admin: {
    group: 'Campus',
    description:
      'Shared UI chrome across Campus. Page-specific copy lives under Content. SEO tab = public Campus defaults (not school white-label).',
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
          label: 'Strings',
          fields: [
            {
              name: 'strings',
              type: 'array',
              labels: { singular: 'String', plural: 'Strings' },
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  required: true,
                  admin: { description: 'e.g. nav.dashboard, common.save' },
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'text',
                  admin: { description: 'Internal note for editors' },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          description:
            'Defaults for Campus public routes. School logos stay in Prisma School.',
          fields: campusSiteSeoFields,
        },
      ],
    },
  ],
};
