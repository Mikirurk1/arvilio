import { parsePaymentConfig } from './payment-map.util';
import {
  resolveStudentManualInvoiceMethods,
  validateStudentManualInvoiceSelection,
} from './manual-invoice-map.util';

describe('manual invoice mapping', () => {
  it('migrates legacy manualInvoice copy into a legacy custom method', () => {
    const config = parsePaymentConfig({
      manualInvoice: {
        instructionsUk: 'Pay by bank transfer to the admin account.',
        receiptHintUk: 'Send payment proof in Telegram.',
      },
    });

    expect(config.manualInvoiceMethods).toHaveLength(1);
    expect(config.manualInvoiceMethods[0]).toMatchObject({
      id: 'manual-legacy',
      kind: 'custom',
      label: 'Manual invoice',
      receiptHintUk: 'Send payment proof in Telegram.',
      instructionsUk: 'Pay by bank transfer to the admin account.',
    });
  });

  it('filters and sorts manual methods for a student allowlist with default method first', () => {
    const methods = parsePaymentConfig({
      manualInvoiceMethods: [
        {
          id: 'iban-main',
          kind: 'iban_sepa',
          label: 'EUR account',
          description: '',
          receiptHintUk: '',
          paymentReferenceHint: '',
          recipientTaxId: null,
          paymentPurpose: 'Tuition payment',
          importantNotes: ['SEPA only', 'EUR transfers only'],
          beneficiaryName: 'SoEnglish',
          iban: 'DE89370400440532013000',
          bankName: 'Deutsche Bank',
          bankCountry: 'Germany',
          bic: 'DEUTDEFF',
        },
        {
          id: 'swift-main',
          kind: 'swift_wire',
          label: 'USD wire',
          description: '',
          receiptHintUk: '',
          paymentReferenceHint: '',
          recipientTaxId: '1234567890',
          paymentPurpose: null,
          importantNotes: ['Arrives in 3-5 business days'],
          beneficiaryName: 'SoEnglish LLC',
          accountNumber: '1234567890',
          iban: null,
          bankName: 'Bank of America',
          bankAddress: 'New York, USA',
          swiftBic: 'BOFAUS3N',
          beneficiaryAddress: 'Kyiv, Ukraine',
          intermediaryBankName: null,
          intermediarySwiftBic: null,
        },
        {
          id: 'card-main',
          kind: 'card_transfer',
          label: 'UAH card',
          description: '',
          receiptHintUk: '',
          paymentReferenceHint: '',
          recipientTaxId: null,
          paymentPurpose: null,
          importantNotes: [],
          beneficiaryName: 'SoEnglish',
          bankName: 'MonoBank',
          cardNumber: '4441111122223333',
        },
      ],
    }).manualInvoiceMethods;

    const selection = validateStudentManualInvoiceSelection(methods, {
      allowedMethodIds: ['iban-main', 'swift-main'],
      defaultMethodId: 'swift-main',
    });
    const visible = resolveStudentManualInvoiceMethods(methods, selection);

    expect(visible.map((method) => method.id)).toEqual(['swift-main', 'iban-main']);
    expect(visible[0]?.recipientTaxId).toBe('1234567890');
    expect(visible[1]?.importantNotes).toEqual(['SEPA only', 'EUR transfers only']);
  });

  it('parses card transfer methods', () => {
    const methods = parsePaymentConfig({
      manualInvoiceMethods: [
        {
          id: 'card-main',
          kind: 'card_transfer',
          label: 'Card transfer',
          description: 'Pay to the bank card below.',
          receiptHintUk: 'Send receipt after payment',
          paymentReferenceHint: 'Student name',
          recipientTaxId: null,
          paymentPurpose: null,
          importantNotes: ['UAH only'],
          beneficiaryName: 'Teriv Mykola',
          bankName: 'MonoBank',
          cardNumber: '4441111122223333',
        },
      ],
    }).manualInvoiceMethods;

    expect(methods).toHaveLength(1);
    expect(methods[0]).toMatchObject({
      kind: 'card_transfer',
      bankName: 'MonoBank',
      cardNumber: '4441111122223333',
    });
  });
});
