import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { documentSeoTab } from '../fields/seo';

/**
 * Per-screen Campus content: page chrome + page strings + optional SEO.
 * Admin uses tabs (same pattern as campus-global / products) so long string
 * lists and SEO do not compete with title/body on one scroll.
 */
export const CampusContent: CollectionConfig = {
  slug: 'campus-content',
  labels: {
    singular: 'Content',
    plural: 'Content',
  },
  admin: {
    useAsTitle: 'slug',
    group: 'Campus',
    defaultColumns: ['slug', 'title', 'updatedAt'],
    description:
      'One document per Campus screen/route. Tabs: Page chrome · Strings · SEO. Shared chrome lives in Global (not Hub Pages).',
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
      admin: { description: 'e.g. dashboard, lessons, login, privacy — route key, not a Hub marketing page' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page',
          description: 'Screen chrome shown as title / subtitle / body (privacy, legal, auth intros).',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
            },
            {
              name: 'subtitle',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor(),
              localized: true,
            },
          ],
        },
        {
          label: 'Strings',
          description: 'UI copy keys for this screen only. Shared keys (nav.*, common.*) live in Global.',
          fields: [
            {
              name: 'strings',
              type: 'array',
              labels: { singular: 'String', plural: 'Strings' },
              admin: {
                description: 'Full dotted keys for this page, e.g. dashboard.hero.title',
              },
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  required: true,
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
        documentSeoTab,
      ],
    },
  ],
};
