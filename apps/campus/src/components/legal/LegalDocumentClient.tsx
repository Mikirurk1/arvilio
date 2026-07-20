'use client';

import {
  buildPaymentRefundHtml,
  buildTermsHtml,
} from '../../content/legal';
import { LegalPageShell, usePublicSellerProfile } from './LegalPageShell';

export function LegalDocumentClient({
  kind,
  templateMarkdown,
}: {
  kind: 'terms' | 'payment-refund';
  templateMarkdown: string;
}) {
  const { seller, loading } = usePublicSellerProfile();
  const html =
    kind === 'terms'
      ? buildTermsHtml(seller, templateMarkdown)
      : buildPaymentRefundHtml(seller, templateMarkdown);

  return (
    <LegalPageShell loading={loading}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalPageShell>
  );
}
