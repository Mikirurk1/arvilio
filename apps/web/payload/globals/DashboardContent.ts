import type { GlobalConfig } from 'payload'

export const DashboardContent: GlobalConfig = {
  slug: 'dashboard-content',
  admin: { group: 'Content' },
  access: { read: () => true },
  fields: [
    { name: 'greeting', type: 'text', defaultValue: 'Good morning' },
    { name: 'subtitle', type: 'text', defaultValue: "Monday, April 20 · You're on a 14-day streak — keep it up!" },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Continue where you left off' },
        { name: 'title', type: 'text', defaultValue: 'Business Vocabulary — Unit 3' },
        { name: 'subtitle', type: 'text', defaultValue: 'Finance & investment terms · 15 words remaining' },
        { name: 'progressLabel', type: 'text', defaultValue: '62% complete' },
      ],
    },
  ],
}
