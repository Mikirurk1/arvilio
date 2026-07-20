import type { CollectionConfig } from 'payload';

/** Product tour tracks (student / teacher / admin / …). */
export const CampusTours: CollectionConfig = {
  slug: 'campus-tours',
  admin: {
    useAsTitle: 'trackId',
    group: 'Campus',
    defaultColumns: ['trackId', 'updatedAt'],
  },
  labels: {
    singular: 'Tour',
    plural: 'Tours',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'trackId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'Level A: student | teacher | admin | adminPlatform. Help (?): helpStudent | helpTeacher | helpAdmin. Empty deck: firstWords. Attach MP3 per step under Tour audio → Voice.',
      },
    },
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'stepId', type: 'text', required: true },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'body', type: 'textarea', required: true, localized: true },
        { name: 'ctaLabel', type: 'text', localized: true },
        { name: 'area', type: 'text' },
        { name: 'target', type: 'text' },
        {
          name: 'voice',
          type: 'upload',
          relationTo: 'campus-tour-audio',
          localized: true,
          admin: {
            description:
              'Optional narration for this locale (MP3). Upload under Campus → Tour audio, then attach here.',
          },
        },
      ],
    },
  ],
};
