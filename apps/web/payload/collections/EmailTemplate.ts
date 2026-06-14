import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const EmailTemplate: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'locale', 'subject', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      Boolean(user && (user as any).role === 'super_admin'),
  },
  fields: [
    {
      name: 'name',
      type: 'select',
      required: true,
      options: [
        { label: 'Welcome', value: 'welcome' },
        { label: 'Lesson Reminder', value: 'lesson_reminder' },
        { label: 'Balance Low', value: 'balance_low' },
        { label: 'Password Reset', value: 'password_reset' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      defaultValue: 'uk',
      options: [
        { label: 'Ukrainian', value: 'uk' },
        { label: 'English', value: 'en' },
        { label: 'Polish', value: 'pl' },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: { description: 'Email subject. Use {{studentName}} for variables.' },
    },
    {
      name: 'htmlBody',
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
      admin: { description: 'Available variables: {{studentName}}, {{lessonDate}}, {{schoolName}}' },
    },
  ],
}
