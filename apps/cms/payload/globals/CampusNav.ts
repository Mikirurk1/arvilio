import type { GlobalConfig } from 'payload';

/** Ordered Campus sidebar navigation. */
export const CampusNav: GlobalConfig = {
  slug: 'campus-nav',
  label: 'Nav',
  admin: {
    group: 'Campus',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'sections',
      type: 'array',
      fields: [
        {
          name: 'sectionKey',
          type: 'text',
          required: true,
          admin: { description: 'Stable id, e.g. learn, schedule' },
        },
        {
          name: 'sectionLabel',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'href', type: 'text', required: true },
            { name: 'label', type: 'text', required: true, localized: true },
            { name: 'icon', type: 'text', required: true },
            {
              name: 'labelKey',
              type: 'text',
              admin: { description: 'Optional campus-strings bucket key override' },
            },
          ],
        },
      ],
    },
  ],
};
