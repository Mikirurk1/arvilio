import type { GlobalConfig } from 'payload'

export const SystemSettings: GlobalConfig = {
  slug: 'system-settings',
  label: 'System',
  admin: { group: 'System' },
  access: { read: () => true },
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Українська', value: 'uk' },
      ],
      admin: { description: 'Default language for the school UI' },
    },
  ],
}
