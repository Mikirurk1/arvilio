import type { CollectionConfig } from 'payload';

/**
 * Tour / onboarding narration MP3 (and ogg/wav). Separate from Shared `media`
 * so imageSizes are not applied to audio uploads.
 */
export const CampusTourAudio: CollectionConfig = {
  slug: 'campus-tour-audio',
  admin: {
    group: 'Campus',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'updatedAt'],
    description: 'Upload MP3 (or OGG/WAV) for product-tour step narration. Attach on Tours → step → Voice.',
  },
  labels: {
    singular: 'Tour audio',
    plural: 'Tour audio',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: 'public/media/tour-audio',
    mimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-wav'],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Optional internal label, e.g. "stu-welcome · en"',
      },
    },
  ],
};
