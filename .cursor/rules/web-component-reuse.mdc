---
description: Reuse Next.js and apps/web UI primitives instead of raw HTML elements.
globs: apps/web/**/*
alwaysApply: false
---

# Web UI — reuse primitives

In **`apps/web`**, do not reach for bare HTML when the project already provides a component. Check nearby files and [`apps/web/src/components/ui/index.ts`](apps/web/src/components/ui/index.ts) first.

## Required mappings

| Avoid | Use instead | Import |
|-------|-------------|--------|
| `<a href="...">` (in-app routes) | `Link` | `import Link from 'next/link'` |
| `<img>` | `Image` | `import Image from 'next/image'` |
| `<input>`, `<textarea>`, `<select>` (forms) | `Field` | `import { Field } from '@/…/components/ui'` (or relative path used in the file) |
| `<button>` | `Button` | `import { Button } from '@/…/components/ui'` |

## Details

- **`Link`** — internal navigation (`/dashboard`, `/students/[id]`, etc.). For external URLs, `<a target="_blank" rel="noopener noreferrer">` is fine.
- **`Image`** — always `next/image` with valid `width`/`height` or `fill` + sized parent; use `alt` for accessibility.
- **`Field`** — labels, hints, errors, `readOnly`, `as="textarea" | "select" | "checkbox"`. `as="select"` is adaptive (custom menu on desktop, native select on mobile). Wrap controls in `<form>` / `<label>` patterns already used on the page.
- **`Button`** — actions, submits, icon buttons (`variant="ghost"`, `startIcon` / `endIcon`). Prefer `type="button"` unless submitting a form (`type="submit"`).

## Also reuse before inventing

- Layout / surfaces: `PageHeader`, `SurfaceCard`, `EmptyStateCard`, `Badge`, `Tabs`, `SegmentedControl`, etc. from `components/ui`.
- Toggle groups (week/month, filters): **`SegmentedControl`** (built on `Button`) instead of a row of raw `<button>`.
- Domain pieces: `components/brand/BrandLogo`, feature folders (`features/`, `components/lessons/`, …) when the same UI already exists.

## Prefer Next.js built-ins (do not reinvent)

| Need | Use | Avoid |
|------|-----|--------|
| In-app navigation | `Link` from `next/link` | `<a href="/…">`, `window.location` |
| Client route changes | `useRouter`, `usePathname`, `useSearchParams` from `next/navigation` | `window.history` |
| Images | `Image` from `next/image` (`fill`, `sizes`, `unoptimized` for blob/API URLs) | `<img>` |
| Fonts | `next/font` in layout | `@font-face` ad hoc per page |
| Code splitting | `next/dynamic` | manual lazy `React.lazy` without SSR care |
| Metadata / SEO | `export const metadata` or `generateMetadata` in `app/` | `<head>` tags in client components |
| Third-party scripts | `next/script` | raw `<script>` in pages |
| Server data in RSC | `async` Server Components + `fetch` / Prisma in `app/` | fetching in `useEffect` when RSC fits |

App config: [`apps/web/next.config.mjs`](apps/web/next.config.mjs) (`rewrites` for `/api`, redirects). Auth cookies go through same-origin `/api` in the browser.

## Rare exceptions (justify in code only if needed)

- Hidden native `<input type="file">` for uploads.
- Third-party APIs that require a raw element ref.
- Non-React HTML inside `dangerouslySetInnerHTML` (avoid when possible).

When touching legacy raw elements in a file you are already editing, convert them to the primitives above if the change is local and low-risk.
