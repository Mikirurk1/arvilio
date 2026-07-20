# Payload CMS v3 Implementation Plan

> **Historical (v1 Campus embed).** **Authoritative plan:** [`docs/arvilio-marketing-site-payload-plan.md`](../../arvilio-marketing-site-payload-plan.md) (v2 — `apps/hub`, brand-kit, product registry, i18n uk/en). Do not extend Campus Payload for ecosystem brand content or multi-product landings.

**Goal:** Embed Payload CMS v3 into `apps/campus` so admins can edit page text, school branding, and email templates from `/cms-admin` without a deploy.
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed Payload CMS v3 into `apps/campus` so admins can edit page text, school branding, and email templates from `/cms-admin` without a deploy.

**Architecture:** Payload v3 embeds as a Next.js route group `(payload)` inside `apps/campus`. It connects to the same Postgres DB as Prisma using its own `@payloadcms/db-postgres` adapter (separate tables, same server). All product code reads content through `src/lib/cms/index.ts` — a thin abstraction that makes future migration trivial.

**Tech Stack:** Payload CMS v3, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, Next.js 16, TypeScript 5.9, PostgreSQL

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/campus/package.json` | modify | add payload deps |
| `apps/campus/payload.config.ts` | create | Payload root config |
| `apps/campus/payload/collections/PageContent.ts` | create | page text blocks collection |
| `apps/campus/payload/collections/EmailTemplate.ts` | create | email template collection |
| `apps/campus/payload/collections/SchoolBranding.ts` | create | school branding collection |
| `apps/campus/payload/seed.ts` | create | seed initial content keys |
| `apps/campus/src/app/(payload)/admin/[[...segments]]/page.tsx` | create | Payload admin UI route |
| `apps/campus/src/app/(payload)/admin/[[...segments]]/not-found.tsx` | create | required by Payload |
| `apps/campus/src/app/(payload)/api/[...slug]/route.ts` | create | Payload REST API route |
| `apps/campus/src/app/(payload)/graphql/route.ts` | create | Payload GraphQL route |
| `apps/campus/src/lib/cms/index.ts` | create | public abstraction: getPageContent, getBranding, getEmailTemplate |
| `apps/campus/src/lib/cms/payload.ts` | create | Payload local API implementation |
| `apps/campus/next.config.mjs` | modify | wrap with withPayload() |
| `apps/campus/src/app/(auth)/login/page.tsx` | modify | read hero title/subtitle from CMS |
| `.env.example` | modify | add PAYLOAD_SECRET |

---

## Task 1: Install Payload CMS v3 dependencies

**Files:**
- Modify: `apps/campus/package.json`

- [ ] **Step 1: Install packages**

```bash
cd apps/campus
npm install payload @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/next
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('payload'); console.log('payload ok')"
```

Expected: `payload ok`

- [ ] **Step 3: Commit**

```bash
git add apps/campus/package.json apps/campus/package-lock.json
git commit -m "feat(cms): install payload cms v3 dependencies"
```

---

## Task 2: Create Payload collections

**Files:**
- Create: `apps/campus/payload/collections/PageContent.ts`
- Create: `apps/campus/payload/collections/EmailTemplate.ts`
- Create: `apps/campus/payload/collections/SchoolBranding.ts`

- [ ] **Step 1: Create directory**

```bash
mkdir -p apps/campus/payload/collections
```

- [ ] **Step 2: Create PageContent collection**

Create `apps/campus/payload/collections/PageContent.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const PageContent: CollectionConfig = {
  slug: 'page-content',
  admin: {
    useAsTitle: 'key',
    group: 'Content',
    defaultColumns: ['key', 'locale', 'scope', 'updatedAt'],
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
      name: 'key',
      type: 'text',
      required: true,
      admin: { description: 'e.g. login.hero.title, dashboard.welcome.subtitle' },
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
      name: 'value',
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
    },
    {
      name: 'scope',
      type: 'select',
      required: true,
      defaultValue: 'platform',
      options: [
        { label: 'Platform (super_admin only)', value: 'platform' },
        { label: 'School (admin editable)', value: 'school' },
      ],
    },
    {
      name: 'description',
      type: 'text',
      admin: { description: 'Internal note for editors' },
    },
  ],
}
```

- [ ] **Step 3: Create EmailTemplate collection**

Create `apps/campus/payload/collections/EmailTemplate.ts`:

```ts
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
```

- [ ] **Step 4: Create SchoolBranding collection**

Create `apps/campus/payload/collections/SchoolBranding.ts`:

```ts
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
      defaultValue: 'Arvilio',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'English Platform',
    },
    {
      name: 'logoUrl',
      type: 'text',
      admin: { description: 'Absolute URL to logo image' },
    },
    {
      name: 'primaryColor',
      type: 'text',
      defaultValue: '#1a1a2e',
      admin: { description: 'Hex color, e.g. #1a1a2e' },
    },
  ],
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/campus/payload/
git commit -m "feat(cms): add payload cms collections (PageContent, EmailTemplate, SchoolBranding)"
```

---

## Task 3: Create Payload config

**Files:**
- Create: `apps/campus/payload.config.ts`

- [ ] **Step 1: Add PAYLOAD_SECRET to env**

Add to `.env.example`:
```
PAYLOAD_SECRET=change-me-in-production-min-32-chars
```

Add to your local `.env`:
```bash
echo "PAYLOAD_SECRET=dev-secret-change-in-production-32ch" >> .env
```

- [ ] **Step 2: Create payload.config.ts**

Create `apps/campus/payload.config.ts`:

```ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { fileURLToPath } from 'url'
import { PageContent } from './payload/collections/PageContent'
import { EmailTemplate } from './payload/collections/EmailTemplate'
import { SchoolBranding } from './payload/collections/SchoolBranding'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [PageContent, EmailTemplate, SchoolBranding],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'fallback-dev-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  i18n: {
    supportedLanguages: { en },
  },
  routes: {
    admin: '/cms-admin',
    api: '/payload-api',
  },
})
```

- [ ] **Step 3: Commit**

```bash
git add apps/campus/payload.config.ts .env.example
git commit -m "feat(cms): add payload.config.ts with postgres adapter"
```

---

## Task 4: Create Next.js route handlers for Payload

**Files:**
- Create: `apps/campus/src/app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `apps/campus/src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- Create: `apps/campus/src/app/(payload)/api/[...slug]/route.ts`

- [ ] **Step 1: Create directories**

```bash
mkdir -p "apps/campus/src/app/(payload)/admin/[[...segments]]"
mkdir -p "apps/campus/src/app/(payload)/api/[...slug]"
```

- [ ] **Step 2: Create admin page route**

Create `apps/campus/src/app/(payload)/admin/[[...segments]]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '../../../../../payload.config'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({ config: Promise.resolve(config) })
}

export default RootPage.bind(null, { config: Promise.resolve(config) })
```

- [ ] **Step 3: Create not-found route**

Create `apps/campus/src/app/(payload)/admin/[[...segments]]/not-found.tsx`:

```tsx
import { NotFoundPage } from '@payloadcms/next/views'
import config from '../../../../../payload.config'

export const dynamic = 'force-dynamic'

export default NotFoundPage.bind(null, { config: Promise.resolve(config) })
```

- [ ] **Step 4: Create API route handler**

Create `apps/campus/src/app/(payload)/api/[...slug]/route.ts`:

```ts
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'
import config from '../../../../payload.config'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

- [ ] **Step 5: Commit**

```bash
git add "apps/campus/src/app/(payload)/"
git commit -m "feat(cms): add payload next.js route handlers"
```

---

## Task 5: Wrap Next.js config with withPayload

**Files:**
- Modify: `apps/campus/next.config.mjs`

- [ ] **Step 1: Read current next.config.mjs**

```bash
cat apps/campus/next.config.mjs
```

- [ ] **Step 2: Add withPayload wrapper**

Add at the top of `apps/campus/next.config.mjs`:
```js
import { withPayload } from '@payloadcms/next/withPayload'
```

Wrap the export at the bottom — change:
```js
export default nextConfig
```
to:
```js
export default withPayload(nextConfig)
```

- [ ] **Step 3: Verify build compiles**

```bash
cd apps/campus && npm run build 2>&1 | tail -20
```

Expected: build completes (warnings OK, errors NOT OK)

- [ ] **Step 4: Commit**

```bash
git add apps/campus/next.config.mjs
git commit -m "feat(cms): wrap next.config with withPayload"
```

---

## Task 6: Create CMS abstraction layer

**Files:**
- Create: `apps/campus/src/lib/cms/payload.ts`
- Create: `apps/campus/src/lib/cms/index.ts`

- [ ] **Step 1: Create directory**

```bash
mkdir -p apps/campus/src/lib/cms
```

- [ ] **Step 2: Create payload implementation**

Create `apps/campus/src/lib/cms/payload.ts`:

```ts
import { unstable_cache } from 'next/cache'
import configPromise from '../../../payload.config'

type Locale = 'uk' | 'en' | 'pl'

async function getPayload() {
  const { getPayload } = await import('payload')
  return getPayload({ config: configPromise })
}

export const getPageContent = unstable_cache(
  async (key: string, locale: Locale = 'uk'): Promise<string> => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'page-content',
      where: { and: [{ key: { equals: key } }, { locale: { equals: locale } }] },
      limit: 1,
    })
    if (!docs[0]) return ''
    // Extract plain text from Lexical rich text
    const value = docs[0]['value'] as any
    if (typeof value === 'string') return value
    // Lexical stores as JSON — extract text nodes
    try {
      const root = value?.root
      const extractText = (node: any): string => {
        if (node?.type === 'text') return node.text ?? ''
        if (node?.children) return node.children.map(extractText).join('')
        return ''
      }
      return extractText(root)
    } catch {
      return ''
    }
  },
  ['page-content'],
  { revalidate: 300 },
)

export const getPageContentHtml = unstable_cache(
  async (key: string, locale: Locale = 'uk'): Promise<string> => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'page-content',
      where: { and: [{ key: { equals: key } }, { locale: { equals: locale } }] },
      limit: 1,
    })
    if (!docs[0]) return ''
    const { lexicalHTML } = await import('@payloadcms/richtext-lexical')
    return lexicalHTML('value', docs[0] as any)
  },
  ['page-content-html'],
  { revalidate: 300 },
)

export const getBranding = unstable_cache(
  async () => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'school-branding',
      limit: 1,
    })
    return docs[0] ?? {
      schoolName: 'Arvilio',
      tagline: 'English Platform',
      logoUrl: null,
      primaryColor: '#1a1a2e',
    }
  },
  ['school-branding'],
  { revalidate: 300 },
)

export const getEmailTemplate = unstable_cache(
  async (name: string, locale: Locale = 'uk') => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'email-templates',
      where: { and: [{ name: { equals: name } }, { locale: { equals: locale } }] },
      limit: 1,
    })
    return docs[0] ?? null
  },
  ['email-templates'],
  { revalidate: 300 },
)
```

- [ ] **Step 3: Create public index**

Create `apps/campus/src/lib/cms/index.ts`:

```ts
// Public abstraction layer — swap payload.ts for custom.ts here if migrating
export { getPageContent, getPageContentHtml, getBranding, getEmailTemplate } from './payload'
```

- [ ] **Step 4: Commit**

```bash
git add apps/campus/src/lib/cms/
git commit -m "feat(cms): add cms abstraction layer (getPageContent, getBranding, getEmailTemplate)"
```

---

## Task 7: Seed initial content

**Files:**
- Create: `apps/campus/payload/seed.ts`

- [ ] **Step 1: Create seed script**

Create `apps/campus/payload/seed.ts`:

```ts
import config from '../payload.config'

const INITIAL_PAGE_CONTENT = [
  { key: 'login.hero.title', locale: 'uk', value: 'Sign in', scope: 'platform', description: 'Login page main heading' },
  { key: 'login.hero.subtitle', locale: 'uk', value: 'Welcome back. Pick up your lessons, practice, and messages in one place.', scope: 'platform', description: 'Login page subtitle' },
  { key: 'dashboard.welcome.title', locale: 'uk', value: 'Good morning', scope: 'school', description: 'Dashboard greeting' },
  { key: 'practice.hero.title', locale: 'uk', value: 'Practice', scope: 'school', description: 'Practice page heading' },
  { key: 'vocabulary.hero.title', locale: 'uk', value: 'Vocabulary', scope: 'school', description: 'Vocabulary page heading' },
]

const INITIAL_BRANDING = {
  schoolName: 'Arvilio',
  tagline: 'English Platform',
  primaryColor: '#1a1a2e',
}

async function seed() {
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  console.log('Seeding page content...')
  for (const item of INITIAL_PAGE_CONTENT) {
    const { docs } = await payload.find({
      collection: 'page-content',
      where: { and: [{ key: { equals: item.key } }, { locale: { equals: item.locale } }] },
      limit: 1,
    })
    if (docs.length === 0) {
      // Create richText value as plain text node for Lexical
      const richValue = {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', text: item.value, version: 1 }], version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      }
      await payload.create({ collection: 'page-content', data: { ...item, value: richValue } })
      console.log(`  ✓ ${item.key} [${item.locale}]`)
    } else {
      console.log(`  - ${item.key} [${item.locale}] already exists, skipping`)
    }
  }

  console.log('Seeding branding...')
  const { docs: brandingDocs } = await payload.find({ collection: 'school-branding', limit: 1 })
  if (brandingDocs.length === 0) {
    await payload.create({ collection: 'school-branding', data: INITIAL_BRANDING })
    console.log('  ✓ branding created')
  } else {
    console.log('  - branding already exists, skipping')
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
```

- [ ] **Step 2: Add seed script to package.json**

In `apps/campus/package.json`, add to `scripts`:
```json
"seed:cms": "npx tsx payload/seed.ts"
```

- [ ] **Step 3: Run seed**

```bash
cd apps/campus && npm run seed:cms
```

Expected output:
```
Seeding page content...
  ✓ login.hero.title [uk]
  ✓ login.hero.subtitle [uk]
  ...
Seed complete.
```

- [ ] **Step 4: Commit**

```bash
git add apps/campus/payload/seed.ts apps/campus/package.json
git commit -m "feat(cms): add payload content seed script"
```

---

## Task 8: Wire login page to CMS

**Files:**
- Modify: `apps/campus/src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Read current login page**

```bash
cat "apps/campus/src/app/(auth)/login/page.tsx"
```

- [ ] **Step 2: Add CMS import and fetch hero text**

The login page is `'use client'` — CMS fetches must happen in a Server Component wrapper. Convert to a thin server page that passes CMS values as props.

At the top of `apps/campus/src/app/(auth)/login/page.tsx`, the pattern is:

```tsx
// Keep 'use client' on the interactive component, but create a server wrapper:
```

Create `apps/campus/src/app/(auth)/login/LoginPageClient.tsx` (move all existing 'use client' code here).

Then update `apps/campus/src/app/(auth)/login/page.tsx` to:

```tsx
import { getPageContent } from '../../../lib/cms'
import { LoginPageClient } from './LoginPageClient'

export default async function LoginPage() {
  const heroTitle = await getPageContent('login.hero.title', 'uk')
  const heroSubtitle = await getPageContent('login.hero.subtitle', 'uk')

  return (
    <LoginPageClient
      heroTitle={heroTitle || 'Sign in'}
      heroSubtitle={heroSubtitle || 'Welcome back. Pick up your lessons, practice, and messages in one place.'}
    />
  )
}
```

`LoginPageClient.tsx` accepts `{ heroTitle: string; heroSubtitle: string }` props and renders them instead of the hardcoded strings.

- [ ] **Step 3: Verify login page still works**

```bash
curl -s http://localhost:4200/login | grep -i "sign in\|welcome"
```

Expected: page renders with CMS text

- [ ] **Step 4: Commit**

```bash
git add "apps/campus/src/app/(auth)/login/"
git commit -m "feat(cms): wire login page hero text to payload cms"
```

---

## Task 9: Verify Payload admin UI loads

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open Payload admin**

Navigate to `http://localhost:4200/cms-admin`

Expected: Payload admin UI login screen loads

- [ ] **Step 3: Create first admin user**

On first load Payload will prompt to create an admin user. Use:
- Email: same as your app super_admin email
- Password: strong password (stored in Payload's own users table, separate from app)

- [ ] **Step 4: Verify collections visible**

After login, check that **PageContent**, **EmailTemplate**, **SchoolBranding** appear in the sidebar under "Content" group.

- [ ] **Step 5: Edit a content block and verify cache invalidation**

1. Edit `login.hero.title` → change text to `Sign in to Arvilio`
2. Wait 5 minutes (cache TTL) OR restart dev server
3. Check `http://localhost:4200/login` shows updated text

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat(cms): payload cms v3 integration complete — /cms-admin live"
```

---

## Success Criteria Checklist

- [ ] `http://localhost:4200/cms-admin` loads Payload admin
- [ ] All 3 collections visible: PageContent, EmailTemplate, SchoolBranding
- [ ] Editing `login.hero.title` in CMS → reflected on `/login` after cache revalidation
- [ ] `npm run build` passes
- [ ] `npm run test:unit` still 975/975 passing (Payload doesn't touch app tests)
- [ ] Prisma migrations unaffected (Payload uses its own `payload_*` tables)
