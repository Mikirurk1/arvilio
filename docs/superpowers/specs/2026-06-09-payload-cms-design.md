# Payload CMS v3 — Design Spec

**Date:** 2026-06-09  
**Status:** Approved  
**Scope:** Embed Payload CMS v3 into `apps/web` for editable static content

---

## Problem

Static text on the site (page headings, login welcome message, school branding, email templates) is hardcoded in TSX files. Admins cannot change it without a deploy. Future multi-language support (UK + EN + PL) requires a content layer with locale support.

## Solution

Embed **Payload CMS v3** into `apps/web` as a Next.js route group. Payload manages content tables in the same Postgres database; Prisma manages all app tables. A thin abstraction layer (`lib/cms/`) isolates all Payload calls so migration to a custom solution later is a one-file change.

---

## Architecture

```
apps/web/
  payload.config.ts            ← Payload root config
  payload/
    collections/
      PageContent.ts           ← page text blocks
      EmailTemplate.ts         ← transactional email templates
      SchoolBranding.ts        ← school name, tagline, logo
  app/
    (payload)/                 ← Payload admin UI at /cms-admin
      admin/
        [[...segments]]/
          page.tsx
  src/lib/cms/
    index.ts                   ← public API: getPageContent, getEmailTemplate, getBranding
    payload.ts                 ← Payload local API calls
```

Payload admin is mounted at `/cms-admin` (not `/admin`) to avoid conflict with the existing `/admin` user-management page.

---

## Collections

### PageContent

| Field | Type | Notes |
|-------|------|-------|
| `key` | text (unique per locale+scope) | e.g. `login.hero.title`, `dashboard.welcome.subtitle` |
| `locale` | select: `uk` \| `en` \| `pl` | default `uk` |
| `value` | richText (Lexical) | rendered to HTML on frontend |
| `scope` | select: `platform` \| `school` | platform = super_admin only; school = admin editable |
| `description` | text | internal note for editors |

### EmailTemplate

| Field | Type | Notes |
|-------|------|-------|
| `name` | select | `welcome` \| `lesson_reminder` \| `balance_low` \| `password_reset` |
| `locale` | select: `uk` \| `en` \| `pl` | |
| `subject` | text | email subject line |
| `htmlBody` | richText (Lexical) | supports variables: `{{studentName}}`, `{{lessonDate}}` etc. |
| `scope` | `platform` only | email templates are platform-level |

### SchoolBranding

| Field | Type | Notes |
|-------|------|-------|
| `schoolName` | text | displayed in sidebar, emails |
| `tagline` | text | subtitle under logo |
| `logoUrl` | upload or URL | |
| `primaryColor` | text | hex, CSS token override |
| `scope` | `school` | admin editable |

---

## Frontend Usage

All content is accessed through the abstraction layer — never directly through Payload internals:

```ts
// Server component or server action
import { getPageContent, getBranding } from '@/lib/cms'

const title = await getPageContent('login.hero.title', 'uk')
const branding = await getBranding()
```

Payload Local API is called in-process (zero HTTP). Output is cached with Next.js `unstable_cache` (revalidate: 300s).

---

## Access Control

Payload has its own auth system. For the MVP, Payload admin (`/cms-admin`) uses **separate Payload credentials** (super_admin + admin emails seeded at startup). This is a known limitation — SSO with NestJS session is a future improvement.

| Role | Can access `/cms-admin` | Can edit `platform` scope | Can edit `school` scope |
|------|------------------------|--------------------------|------------------------|
| super_admin Payload user | Yes | Yes | Yes |
| admin Payload user | Yes | No | Yes |

---

## Migration Path

If moving to a custom solution later:

1. Create Prisma models (`ContentBlock`, `EmailTemplate`, `SchoolBranding`) with equivalent fields
2. Write a one-time migration script: read from Payload DB tables → insert into Prisma tables
3. Implement `lib/cms/custom.ts` with the same function signatures as `lib/cms/payload.ts`
4. Swap `lib/cms/index.ts` to re-export from `custom.ts`

No product page TSX changes needed — the abstraction layer handles the switch.

---

## Seed Content (initial keys)

| Key | Default value (uk) | Page |
|-----|-------------------|------|
| `login.hero.title` | `Sign in` | Login |
| `login.hero.subtitle` | `Welcome back. Pick up your lessons, practice, and messages in one place.` | Login |
| `dashboard.welcome.title` | `Good morning` | Dashboard |
| `branding.school_name` | `SoEnglish` | Global |
| `branding.tagline` | `English Platform` | Global |
| `email.welcome.subject` | `Welcome to SoEnglish` | Email |

---

## Out of Scope (this spec)

- SSO between NestJS and Payload (future)
- Locale switcher on frontend (future — structure is ready)
- Media/image management beyond logo URL (future)
- Polish (`pl`) locale content (future — field exists, content seeded later)

---

## Success Criteria

1. `/cms-admin` loads Payload admin UI with PageContent, EmailTemplate, SchoolBranding collections
2. Changing `login.hero.title` in CMS → reflected on `/login` within 5 minutes (cache TTL) without deploy
3. All content reads go through `lib/cms/index.ts`
4. Existing Prisma migrations are not affected
5. `npm run build` passes with Payload embedded
