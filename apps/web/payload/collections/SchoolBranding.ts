import type { CollectionConfig } from 'payload'

export const SchoolBranding: CollectionConfig = {
  slug: 'school-branding',
  admin: {
    useAsTitle: 'schoolName',
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: () => false,
  },
  fields: [
    {
      name: 'schoolName',
      type: 'text',
      required: true,
      defaultValue: 'SoEnglish',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'English Platform',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'School logo image' },
    },
    {
      name: 'primaryColor',
      type: 'text',
      defaultValue: '#1a1a2e',
      admin: { description: 'Hex color, e.g. #1a1a2e' },
    },
  ],
}
