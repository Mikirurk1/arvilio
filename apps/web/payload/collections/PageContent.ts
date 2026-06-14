import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const PageContent: CollectionConfig = {
  slug: 'page-content',
  admin: {
    useAsTitle: 'key',
    group: 'Content',
    defaultColumns: ['key', 'locale', 'scope', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as any).role === 'super_admin'),
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      admin: { description: 'e.g. login.hero.title, dashboard.welcome.subtitle' },
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      defaultValue: 'uk',
      options: [
        { label: 'Ukrainian', value: 'uk' },
        { label: 'English', value: 'en' },
        { label: 'Polish', value: 'pl' },
      ],
    },
    {
      name: 'value',
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
    },
    {
      name: 'scope',
      type: 'select',
      required: true,
      defaultValue: 'platform',
      options: [
        { label: 'Platform (super_admin only)', value: 'platform' },
        { label: 'School (admin editable)', value: 'school' },
      ],
    },
    {
      name: 'description',
      type: 'text',
      admin: { description: 'Internal note for editors' },
    },
  ],
}
