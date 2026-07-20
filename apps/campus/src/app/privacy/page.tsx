import type { Metadata } from 'next';
import { LegalFooter } from '../../components/legal/LegalFooter';
import { legalMarkdownToHtml } from '../../content/legal/render';
import {
  buildCampusPublicMetadata,
  getCampusPage,
} from '../../lib/cms/campus-cms';
import { lexicalToMarkdownSource } from '../../lib/cms';
import { resolveRequestCampusLocale } from '../../lib/cms/request-locale';
import { CAMPUS_UI_PAGES, campusUiFallbackMap } from '@pkg/types';
import { PrivacyHeading } from './PrivacyHeading';
import styles from './page.module.scss';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestCampusLocale();
  return buildCampusPublicMetadata({
    slug: 'privacy',
    locale,
    path: '/privacy',
    fallbackTitle: 'Privacy Policy',
  });
}

function fallbackPrivacyMarkdown(locale: 'uk' | 'en'): string {
  const page = CAMPUS_UI_PAGES.find((p) => p.slug === 'privacy');
  return page?.locales[locale]?.body?.trim() || page?.locales.en.body?.trim() || '';
}

export default async function PrivacyPage() {
  const locale = await resolveRequestCampusLocale();
  const cms = await getCampusPage('privacy', locale);
  const markdown =
    lexicalToMarkdownSource(cms?.body).trim() ||
    fallbackPrivacyMarkdown(locale === 'uk' ? 'uk' : 'en');
  const html = legalMarkdownToHtml(markdown);
  const updated = '27 June 2026';
  const strings = campusUiFallbackMap(locale === 'uk' ? 'uk' : 'en');

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <PrivacyHeading updated={updated} />
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p>{strings['privacy.title']}</p>
        )}
      </article>
      <LegalFooter />
    </main>
  );
}
