import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { pagesSeoCollapsible } from '../fields/seo';


export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'slug',
    group: 'Hub',
    defaultColumns: ['slug', 'title', 'updatedAt'],
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
      admin: {
        description: 'e.g. home, pricing, legal-terms, legal-privacy, legal-cookies',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor(),
      localized: true,
    },
    pagesSeoCollapsible,
  ],
};
