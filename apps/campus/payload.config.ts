import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { uk } from '@payloadcms/translations/languages/uk'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { Media } from './payload/collections/Media'
import { PageContent } from './payload/collections/PageContent'
import { EmailTemplate } from './payload/collections/EmailTemplate'
import { SchoolBranding } from './payload/collections/SchoolBranding'
import { DashboardContent } from './payload/globals/DashboardContent'
import { PracticeContent } from './payload/globals/PracticeContent'
import { QuizContent } from './payload/globals/QuizContent'
import { CalendarContent } from './payload/globals/CalendarContent'
import { ProfileContent } from './payload/globals/ProfileContent'
import { SystemSettings } from './payload/globals/SystemSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const payloadSecret = process.env.PAYLOAD_SECRET
if (!payloadSecret || payloadSecret.length < 32) {
  throw new Error('PAYLOAD_SECRET env var must be set (min 32 chars)')
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { en, uk },
    fallbackLanguage: 'en',
  },
  collections: [Media, PageContent, EmailTemplate, SchoolBranding],
  globals: [DashboardContent, PracticeContent, QuizContent, CalendarContent, ProfileContent, SystemSettings],
  editor: lexicalEditor(),
  sharp,
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL ?? process.env.DATABASE_URL,
    },
    schemaName: 'payload',
    push: false,
  }),
  routes: {
    admin: '/cms-admin',
    api: '/payload-api',
  },
})
