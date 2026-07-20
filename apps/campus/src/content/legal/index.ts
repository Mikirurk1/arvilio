import type { PublicSellerProfile } from '../../lib/seller-profile';
import {
  PAYMENT_REFUND_TEMPLATE_EN,
  TERMS_TEMPLATE_EN,
} from './templates';
import { applyLegalTemplate, legalMarkdownToHtml, type LegalTemplateVars } from './render';

export function sellerToLegalVars(seller: PublicSellerProfile): LegalTemplateVars {
  return {
    schoolName: seller.schoolName || 'School',
    legalName: seller.legalName || seller.schoolName || 'Seller',
    legalAddress: seller.legalAddress || '',
    legalCountry: seller.legalCountry || 'UA',
    supportEmail: seller.supportEmail || '',
    supportPhone: seller.supportPhone || '',
    mcc: seller.mcc || '8299',
  };
}

export function buildTermsHtml(
  seller: PublicSellerProfile,
  cmsTemplateMarkdown?: string | null,
): string {
  const vars = sellerToLegalVars(seller);
  const md = seller.termsOverrideMd?.trim()
    ? applyLegalTemplate(seller.termsOverrideMd, vars)
    : applyLegalTemplate(
        (cmsTemplateMarkdown?.trim() || TERMS_TEMPLATE_EN),
        vars,
      );
  return legalMarkdownToHtml(md);
}

export function buildPaymentRefundHtml(
  seller: PublicSellerProfile,
  cmsTemplateMarkdown?: string | null,
): string {
  const vars = sellerToLegalVars(seller);
  const md = seller.paymentRefundOverrideMd?.trim()
    ? applyLegalTemplate(seller.paymentRefundOverrideMd, vars)
    : applyLegalTemplate(
        (cmsTemplateMarkdown?.trim() || PAYMENT_REFUND_TEMPLATE_EN),
        vars,
      );
  return legalMarkdownToHtml(md);
}
