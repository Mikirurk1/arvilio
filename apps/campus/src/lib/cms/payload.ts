import { unstable_cache } from 'next/cache'
import configPromise from '../../../payload.config'

type Locale = 'uk' | 'en' | 'pl'

async function getPayloadClient() {
  const { getPayload } = await import('payload')
  return getPayload({ config: configPromise })
}

function extractLexicalText(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    const node = value as any
    if (node?.type === 'text') return node.text ?? ''
    if (node?.children) return (node.children as any[]).map(extractLexicalText).join('')
    if (node?.root) return extractLexicalText(node.root)
    return ''
  } catch {
    return ''
  }
}

export const getPageContent = unstable_cache(
  async (key: string, locale: Locale = 'uk'): Promise<string> => {
    try {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'page-content',
        where: { and: [{ key: { equals: key } }, { locale: { equals: locale } }] },
        limit: 1,
      })
      if (!docs[0]) return ''
      return extractLexicalText((docs[0] as any).value)
    } catch {
      return ''
    }
  },
  ['cms-page-content'],
  { revalidate: 300 },
)

export const getBranding = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'school-branding',
        limit: 1,
      })
      return (docs[0] as any) ?? {
        schoolName: 'SoEnglish',
        tagline: 'English Platform',
        logoUrl: null,
        primaryColor: '#1a1a2e',
      }
    } catch {
      return {
        schoolName: 'SoEnglish',
        tagline: 'English Platform',
        logoUrl: null,
        primaryColor: '#1a1a2e',
      }
    }
  },
  ['cms-school-branding'],
  { revalidate: 300 },
)

export const getEmailTemplate = unstable_cache(
  async (name: string, locale: Locale = 'uk') => {
    try {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'email-templates',
        where: { and: [{ name: { equals: name } }, { locale: { equals: locale } }] },
        limit: 1,
      })
      return (docs[0] as any) ?? null
    } catch {
      return null
    }
  },
  ['cms-email-templates'],
  { revalidate: 300 },
)

export const getDashboardContent = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient()
      return await payload.findGlobal({ slug: 'dashboard-content' }) as any
    } catch {
      return null
    }
  },
  ['cms-dashboard-content'],
  { revalidate: 300 },
)

export const getPracticeContent = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient()
      return await payload.findGlobal({ slug: 'practice-content' }) as any
    } catch {
      return null
    }
  },
  ['cms-practice-content'],
  { revalidate: 300 },
)

export const getQuizContent = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient()
      return await payload.findGlobal({ slug: 'quiz-content' }) as any
    } catch {
      return null
    }
  },
  ['cms-quiz-content'],
  { revalidate: 300 },
)

export const getCalendarContent = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient()
      return await payload.findGlobal({ slug: 'calendar-content' }) as any
    } catch {
      return null
    }
  },
  ['cms-calendar-content'],
  { revalidate: 300 },
)

export const getProfileContent = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient()
      return await payload.findGlobal({ slug: 'profile-content' }) as any
    } catch {
      return null
    }
  },
  ['cms-profile-content'],
  { revalidate: 300 },
)
