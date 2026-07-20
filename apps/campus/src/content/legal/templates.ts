/** Platform default EN legal templates. Schools may override via seller profile markdown fields. */

export const TERMS_TEMPLATE_EN = `# Public offer (buyer–seller terms)

**Last updated:** 11 July 2026

This public offer is made by **{{legalName}}** (“Seller”), operating the school **{{schoolName}}** on the Arvilio Campus platform, to any person (“Buyer”) who purchases prepaid language lesson credits.

## 1. Subject of the offer

The Seller offers prepaid **digital lesson credits** for language instruction delivered online. Credits are applied to the Buyer’s lesson balance in the school’s Campus account. There is **no physical shipping**.

## 2. Allowed products

The Seller sells **prepaid language lesson credits only**. The catalog does not include gambling, adult content, weapons, crypto assets, or other prohibited goods.

## 3. Price and payment

Prices are shown on the public offer page and at checkout in the stated currency. Amounts are greater than zero. Payment is processed by the school’s enabled payment providers. Completing checkout constitutes acceptance of this offer.

## 4. Delivery

After successful payment, lesson credits are credited to the Buyer’s account balance (digital delivery). Typical delivery is immediate after the payment provider confirms success.

## 5. Refunds and cancellation

Refund and cancellation terms are described in the [Payment & refund policy](/legal/payment-refund).

## 6. Seller details

- **Legal name:** {{legalName}}
- **Address:** {{legalAddress}}
- **Country:** {{legalCountry}}
- **MCC:** {{mcc}} (Schools / Educational Services unless otherwise stated)
- **Support:** {{supportEmail}}{{supportPhoneLine}}

## 7. Platform

Campus software is provided by Arvilio. The Seller is the merchant of record for lesson purchases unless otherwise stated at checkout.

## 8. Acceptance

By paying for a package, the Buyer accepts these terms. Questions: contact the Seller using the details above or via [Contacts](/legal/contacts).
`;

export const PAYMENT_REFUND_TEMPLATE_EN = `# Payment, delivery & refund policy

**Last updated:** 11 July 2026

This policy applies to prepaid language lesson credits sold by **{{legalName}}** (“Seller”) for school **{{schoolName}}**.

## 1. Payment methods

Checkout may offer one or more of the payment methods enabled by the school (for example card processors or wallets). The Buyer pays through the school’s payment provider; Arvilio does not store full card numbers on Campus servers when a PSP is used.

## 2. Delivery (digital)

Products are **digital lesson credits**. There is no physical delivery or shipping. Credits appear on the Buyer’s lesson balance after the payment provider confirms a successful payment.

## 3. Pricing

Catalog and checkout prices are non-zero amounts in the currency shown. Taxes, if applicable, follow the Seller’s local rules and may be included in the displayed price.

## 4. Refunds

- Unused prepaid credits may be refunded at the Seller’s discretion when required by applicable law or the payment provider’s rules.
- Requests should be sent to **{{supportEmail}}** with the payment reference and account email.
- If a payment failed or was charged twice, contact support promptly so the Seller can work with the payment provider.
- Chargebacks are handled under the rules of the payment method used.

## 5. Cancellation

The Buyer may cancel an unpaid checkout at any time. After successful payment, cancellation means requesting a refund of unused credits as above.

## 6. Contact

- **Email:** {{supportEmail}}
- **Phone:** {{supportPhone}}
- **Address:** {{legalAddress}}, {{legalCountry}}

See also [Terms](/legal/terms) and [Contacts](/legal/contacts).
`;
