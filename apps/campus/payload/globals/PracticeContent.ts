import type { GlobalConfig } from 'payload'

export const PracticeContent: GlobalConfig = {
  slug: 'practice-content',
  admin: { group: 'Content' },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Practice' },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue:
        'Pick an activity: build vocabulary like in the Vocabulary area, or run drills like in the Quiz — all from one place.',
    },
    {
      name: 'activities',
      type: 'array',
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'href', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'text' },
        { name: 'tag', type: 'text' },
        { name: 'tagClass', type: 'text' },
        { name: 'stat', type: 'text' },
        { name: 'accent', type: 'text' },
        { name: 'disabled', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
