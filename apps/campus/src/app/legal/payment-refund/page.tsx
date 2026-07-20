import type { Metadata } from 'next';
import { PAYMENT_REFUND_TEMPLATE_EN } from '../../../content/legal/templates';
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
    slug: 'legal-payment-refund',
    locale,
    path: '/legal/payment-refund',
    fallbackTitle: 'Payment & refund',
  });
}

export default async function LegalPaymentRefundPage() {
  const locale = await resolveRequestCampusLocale();
  const cms = await getCampusPage('legal-payment-refund', locale);
  const templateMarkdown =
    lexicalToMarkdownSource(cms?.body).trim() || PAYMENT_REFUND_TEMPLATE_EN;
  return (
    <LegalDocumentClient kind="payment-refund" templateMarkdown={templateMarkdown} />
  );
}
