import type { GlobalConfig } from 'payload'

export const QuizContent: GlobalConfig = {
  slug: 'quiz-content',
  admin: { group: 'Content' },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Quiz & Practice' },
    { name: 'subtitle', type: 'text', defaultValue: 'Test your grammar and vocabulary knowledge' },
  ],
}
