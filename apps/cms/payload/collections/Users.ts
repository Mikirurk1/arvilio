import type { CollectionConfig } from 'payload';

/** CMS editors — shared across brands (not Campus/Connect end users). */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Shared',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
};
