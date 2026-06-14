import type { GlobalConfig } from 'payload'

export const ProfileContent: GlobalConfig = {
  slug: 'profile-content',
  admin: { group: 'Content' },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Profile & Settings' },
    { name: 'subtitle', type: 'text', defaultValue: 'Manage your account and preferences' },
  ],
}
