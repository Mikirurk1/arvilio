import type { Metadata } from 'next';
import { TERMS_TEMPLATE_EN } from '../../../content/legal/templates';
import { LegalDocumentClient } from '../../../components/legal/LegalDocumentClient';
import {
  buildCampusPublicMetadata,
  getCampusPage,
} from '../../../lib/cms/campus-cms';
import { lexicalToMarkdownSource } from '../../../lib/cms';
import { resolveRequestCampusLocale } from '../../../lib/cms/request-locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestCampusLocale();
  return buildCampusPublicMetadata({
    slug: 'legal-terms',
    locale,
    path: '/legal/terms',
    fallbackTitle: 'Terms of use',
  });
}

export default async function LegalTermsPage() {
  const locale = await resolveRequestCampusLocale();
  const cms = await getCampusPage('legal-terms', locale);
  const templateMarkdown =
    lexicalToMarkdownSource(cms?.body).trim() || TERMS_TEMPLATE_EN;
  return <LegalDocumentClient kind="terms" templateMarkdown={templateMarkdown} />;
}
