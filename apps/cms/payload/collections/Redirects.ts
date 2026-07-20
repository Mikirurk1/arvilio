import type { CollectionConfig } from 'payload';

/** Marketing / SEO redirects applied by Hub middleware. */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'fromPath',
    group: 'Hub',
    defaultColumns: ['fromPath', 'statusCode', 'enabled', 'updatedAt'],
    description:
      '301/302 redirects for Hub SEO (fromPath → toPath or absolute toUrl). Applied in Hub middleware. Prefer toPath for internal moves; avoid redirect chains; disable instead of deleting while verifying.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'fromPath',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Source path without locale, e.g. /old-pricing or /uk/old (locale-aware matching in Hub).',
      },
    },
    {
      name: 'toPath',
      type: 'text',
      admin: {
        description: 'Internal destination path (preferred), e.g. /pricing',
        condition: (_, siblingData) => !siblingData?.toUrl,
      },
    },
    {
      name: 'toUrl',
      type: 'text',
      admin: {
        description: 'Absolute external URL (use instead of toPath)',
        condition: (_, siblingData) => !siblingData?.toPath,
      },
    },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { label: '301 Permanent', value: '301' },
        { label: '302 Temporary', value: '302' },
      ],
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};
