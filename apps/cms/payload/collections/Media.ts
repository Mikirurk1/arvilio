import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Shared' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    imageSizes: [
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        withoutEnlargement: true,
      },
      {
        name: 'logo',
        width: 320,
        height: 80,
        position: 'centre',
        withoutEnlargement: true,
      },
      {
        name: 'thumb',
        width: 200,
        height: 200,
        position: 'centre',
        withoutEnlargement: true,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Required alt text (a11y + SEO). Prefer OG uploads at 1200×630; logos at ~320×80. Sizes og/logo/thumb are generated on upload.',
      },
    },
  ],
};
