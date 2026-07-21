import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { en } from '@payloadcms/translations/languages/en';
import { uk } from '@payloadcms/translations/languages/uk';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@pkg/types';
import { Users } from './payload/collections/Users';
import { Media } from './payload/collections/Media';
import { Products } from './payload/collections/Products';
import { Pages } from './payload/collections/Pages';
import { Redirects } from './payload/collections/Redirects';
import { CampusContent } from './payload/collections/CampusContent';
import { CampusTours } from './payload/collections/CampusTours';
import { CampusTourAudio } from './payload/collections/CampusTourAudio';
import { BrandKit } from './payload/globals/BrandKit';
import { SiteSettings } from './payload/globals/SiteSettings';
import { CampusNav } from './payload/globals/CampusNav';
import { CampusGlobal } from './payload/globals/CampusGlobal';
import { ConnectPrep } from './payload/globals/BrandPrep';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const payloadSecret = process.env.PAYLOAD_SECRET;
if (!payloadSecret || payloadSecret.length < 32) {
  throw new Error('PAYLOAD_SECRET env var must be set (min 32 chars)');
}

/**
 * Company + Campus UI CMS schema (marketing Hub + Campus chrome).
 * Legacy Campus embed used schema `payload` — no longer written by apps.
 */
const schemaName = process.env.PAYLOAD_WWW_SCHEMA ?? 'payload_www';

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(
        dirname,
        'src/app/(payload)/cms-admin/importMap.js',
      ),
    },
  },
  i18n: {
    supportedLanguages: { en, uk },
    fallbackLanguage: 'en',
  },
  localization: {
    locales: SUPPORTED_LOCALES.map((code) => ({
      code,
      label: code.toUpperCase(),
    })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  collections: [Users, Media, Products, Pages, Redirects, CampusContent, CampusTourAudio, CampusTours],
  globals: [BrandKit, SiteSettings, CampusNav, CampusGlobal, ConnectPrep],
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
    schemaName,
    // Tables are created via migrate scripts / prior push. Interactive Drizzle
    // rename prompts hang VS Code tasks — keep push off in local unless migrating.
    push: process.env.PAYLOAD_PUSH === 'true',
  }),
  routes: {
    admin: '/cms-admin',
    api: '/payload-api',
  },
  // Payload Config generics can blow TS recursion depth in monorepo tsc; runtime is fine.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload Config depth
} as any);
