import type { PaymentMethodKindDto } from '@pkg/types';
import type { TranslateFn } from '../../../lib/cms/nav-i18n';

export type ProviderFieldHelpKey =
  | 'mode'
  | 'stripe.livePublishableKey'
  | 'stripe.testPublishableKey'
  | 'stripe.liveSecretKey'
  | 'stripe.liveWebhookSecret'
  | 'stripe.testSecretKey'
  | 'stripe.testWebhookSecret'
  | 'liqpay.livePublicKey'
  | 'liqpay.testPublicKey'
  | 'liqpay.livePrivateKey'
  | 'liqpay.testPrivateKey'
  | 'wayforpay.liveMerchantAccount'
  | 'wayforpay.liveMerchantDomainName'
  | 'wayforpay.testMerchantAccount'
  | 'wayforpay.testMerchantDomainName'
  | 'wayforpay.liveSecretKey'
  | 'wayforpay.testSecretKey'
  | 'lemonsqueezy.liveStoreId'
  | 'lemonsqueezy.liveVariantId'
  | 'lemonsqueezy.liveVariantCurrency'
  | 'lemonsqueezy.testStoreId'
  | 'lemonsqueezy.testVariantId'
  | 'lemonsqueezy.testVariantCurrency'
  | 'lemonsqueezy.liveApiKey'
  | 'lemonsqueezy.liveWebhookSecret'
  | 'lemonsqueezy.testApiKey'
  | 'lemonsqueezy.testWebhookSecret'
  | 'paddle.liveApiKey'
  | 'paddle.liveWebhookSecret'
  | 'paddle.testApiKey'
  | 'paddle.testWebhookSecret'
  | 'monopay.liveToken'
  | 'monopay.testToken'
  | 'paypal.liveClientId'
  | 'paypal.testClientId'
  | 'paypal.liveClientSecret'
  | 'paypal.liveWebhookId'
  | 'paypal.testClientSecret'
  | 'paypal.testWebhookId';

export type PaymentProviderMeta = {
  title: string;
  description: string;
  docsUrl?: string;
  docsLabel?: string;
  supportsModeSwitch: boolean;
  modeHelp?: string;
  setupChecklist: string[];
  fieldHelp: Partial<Record<ProviderFieldHelpKey, string>>;
};

export const PAYMENT_PROVIDER_META: Record<PaymentMethodKindDto, PaymentProviderMeta> = {
  manual_invoice: {
    title: 'Manual invoice',
    description: 'Bank transfer; admin credits lessons manually.',
    supportsModeSwitch: false,
    setupChecklist: [
      'Add one or more manual methods such as IBAN / SEPA or SWIFT wire.',
      'Fill in the recipient details students need to complete a transfer.',
      'After payment arrives, credit lessons manually in the student Billing tab.',
    ],
    fieldHelp: {},
  },
  stripe: {
    title: 'Stripe',
    description: 'Card payments via Stripe Checkout.',
    docsUrl: 'https://docs.stripe.com/test-mode',
    docsLabel: 'Stripe testing docs',
    supportsModeSwitch: true,
    modeHelp:
      'Stripe uses separate test and live API keys and separate webhook signing secrets for each environment.',
    setupChecklist: [
      'Create test and live API keys in Developers -> API keys.',
      'Create a webhook endpoint for each environment that points to your backend Stripe webhook URL.',
      'Save the secret key and webhook signing secret for each environment in this school settings panel.',
      'Save the publishable key for each environment in this school settings panel.',
    ],
    fieldHelp: {
      mode: 'Choose which Stripe environment the backend should use for new checkouts and webhook verification.',
      'stripe.livePublishableKey':
        'Stripe Dashboard -> Developers -> API keys -> switch to Live mode -> reveal the Publishable key (pk_live_...).',
      'stripe.testPublishableKey':
        'Stripe Dashboard -> Developers -> API keys -> Sandbox / Test mode -> reveal the Publishable key (pk_test_...).',
      'stripe.liveSecretKey':
        'Stripe Dashboard -> Developers -> API keys -> Live mode -> reveal the Secret key (sk_live_...).',
      'stripe.liveWebhookSecret':
        'Stripe Dashboard -> Developers -> Webhooks -> open your live endpoint -> reveal the Signing secret (whsec_...).',
      'stripe.testSecretKey':
        'Stripe Dashboard -> Developers -> API keys -> Test mode -> reveal the Secret key (sk_test_...).',
      'stripe.testWebhookSecret':
        'Stripe Dashboard -> Developers -> Webhooks -> open your test endpoint -> reveal the Signing secret (whsec_...).',
    },
  },
  liqpay: {
    title: 'LiqPay',
    description: 'Ukrainian payments via LiqPay.',
    docsUrl: 'https://www.liqpay.ua/doc/api/testing',
    docsLabel: 'LiqPay testing docs',
    supportsModeSwitch: true,
    modeHelp:
      'LiqPay has separate test and live key pairs. Test keys usually start with sandbox_.',
    setupChecklist: [
      'Open your LiqPay merchant account and go to Company settings -> API.',
      'Copy the public and private key for both live and test environments.',
      'Save private keys in this school settings panel and keep public keys alongside them.',
      'Use test mode first to verify card flows without real debits.',
    ],
    fieldHelp: {
      mode: 'Choose whether LiqPay checkouts should be created in sandbox mode or in the live environment.',
      'liqpay.livePublicKey':
        'LiqPay merchant cabinet -> Company settings -> API -> copy the live Public key.',
      'liqpay.testPublicKey':
        'LiqPay merchant cabinet -> Company settings -> API -> copy the test Public key (often starts with sandbox_).',
      'liqpay.livePrivateKey':
        'LiqPay merchant cabinet -> Company settings -> API -> copy the live Private key.',
      'liqpay.testPrivateKey':
        'LiqPay merchant cabinet -> Company settings -> API -> copy the test Private key.',
    },
  },
  wayforpay: {
    title: 'WayForPay',
    description: 'Hosted checkout via WayForPay.',
    docsUrl: 'https://wiki.wayforpay.com/en/view/852472',
    docsLabel: 'WayForPay test details',
    supportsModeSwitch: true,
    modeHelp:
      'WayForPay testing uses separate merchant credentials. Public test credentials exist, but you can also override them with your own test credentials.',
    setupChecklist: [
      'Open your WayForPay merchant profile and copy Merchant account / Merchant secret key from Merchant Details.',
      'Save live and test merchant secrets in this school settings panel.',
      'Set merchant account and domain for each environment in this school settings panel.',
      'Point serviceUrl callbacks to your backend WayForPay callback endpoint.',
    ],
    fieldHelp: {
      mode: 'Choose whether the backend should use live merchant credentials or test merchant credentials.',
      'wayforpay.liveMerchantAccount':
        'WayForPay dashboard -> Merchant Details -> Merchant account / Merchant login for your live shop.',
      'wayforpay.liveMerchantDomainName':
        'Use the public domain of your storefront or site that WayForPay should bind to the merchant profile.',
      'wayforpay.testMerchantAccount':
        'Use your own WayForPay test merchant account, or keep the official public test merchant if you only need technical validation.',
      'wayforpay.testMerchantDomainName':
        'Use the domain or hostname you will test against; if left empty the backend can fall back to your web app URL.',
      'wayforpay.liveSecretKey':
        'WayForPay dashboard -> Merchant Details -> copy the live merchant secret key.',
      'wayforpay.testSecretKey':
        'WayForPay test merchant docs or your own test merchant profile -> copy the test secret key.',
    },
  },
  lemonsqueezy: {
    title: 'Lemon Squeezy',
    description: 'Hosted checkout via Lemon Squeezy.',
    docsUrl: 'https://docs.lemonsqueezy.com/guides/developer-guide/testing-going-live',
    docsLabel: 'Lemon Squeezy test mode',
    supportsModeSwitch: true,
    modeHelp:
      'Lemon Squeezy uses one API base URL, but test and live stores, API keys, products, variants, and webhooks are separated by mode.',
    setupChecklist: [
      'Use the store toggle in the Lemon Squeezy admin to switch between Test mode and Live mode.',
      'Create an API key in each mode and save it in this school settings panel.',
      'Create a webhook for each mode and save its signing secret in this school settings panel.',
      'Copy the Store ID and Variant ID for each environment into these settings.',
    ],
    fieldHelp: {
      mode: 'Choose which Lemon Squeezy environment should be used for checkout creation and webhook verification.',
      'lemonsqueezy.liveStoreId':
        'Lemon Squeezy admin in Live mode -> open the target store -> copy the Store ID.',
      'lemonsqueezy.liveVariantId':
        'Lemon Squeezy admin in Live mode -> open the product variant you want to charge through -> copy the Variant ID.',
      'lemonsqueezy.liveVariantCurrency':
        'ISO currency of the live variant (checkout uses the variant currency, not the package currency field alone).',
      'lemonsqueezy.testStoreId':
        'Lemon Squeezy admin in Test mode -> open the target store -> copy the Store ID for the test store.',
      'lemonsqueezy.testVariantId':
        'Lemon Squeezy admin in Test mode -> open the test product variant -> copy the Variant ID.',
      'lemonsqueezy.testVariantCurrency':
        'ISO currency of the test variant. Must match packages you sell through Lemon Squeezy in test mode.',
      'lemonsqueezy.liveApiKey':
        'Lemon Squeezy admin in Live mode -> Settings / API -> create or copy the live API key.',
      'lemonsqueezy.liveWebhookSecret':
        'Lemon Squeezy admin in Live mode -> Webhooks -> open the webhook -> copy the signing secret.',
      'lemonsqueezy.testApiKey':
        'Lemon Squeezy admin in Test mode -> Settings / API -> create or copy the test API key.',
      'lemonsqueezy.testWebhookSecret':
        'Lemon Squeezy admin in Test mode -> Webhooks -> open the webhook -> copy the signing secret.',
    },
  },
  paddle: {
    title: 'Paddle',
    description: 'Merchant-of-record checkout via Paddle.',
    docsUrl: 'https://developer.paddle.com/build/tools/sandbox',
    docsLabel: 'Paddle sandbox docs',
    supportsModeSwitch: true,
    modeHelp:
      'Paddle has separate sandbox and live API base URLs, API keys, and notification destination secrets.',
    setupChecklist: [
      'Create live and sandbox API keys in Developer tools -> Authentication.',
      'Create notification destinations for both environments that point to your backend Paddle webhook URL.',
      'Save the API key and webhook secret for each environment in this school settings panel.',
      'No extra dashboard IDs are needed here because transactions are created dynamically per package amount.',
    ],
    fieldHelp: {
      mode: 'Choose whether Paddle transactions should be created against the sandbox API or the live API.',
      'paddle.liveApiKey':
        'Paddle -> Developer tools -> Authentication -> create or copy the live API key (pdl_live_apikey_...).',
      'paddle.liveWebhookSecret':
        'Paddle -> Notification destinations -> open the live destination -> copy the endpoint secret.',
      'paddle.testApiKey':
        'Paddle -> Developer tools -> Authentication -> create or copy the sandbox API key (pdl_sdbx_apikey_...).',
      'paddle.testWebhookSecret':
        'Paddle -> Notification destinations -> open the sandbox destination -> copy the endpoint secret.',
    },
  },
  monopay: {
    title: 'MonoPay',
    description: 'Plata by mono hosted invoice page.',
    docsUrl: 'https://api.monobank.ua/docs/acquiring.html',
    docsLabel: 'Mono acquiring docs',
    supportsModeSwitch: true,
    modeHelp:
      'MonoPay uses different merchant tokens for test and live setups. The backend creates invoices server-side and verifies webhook signatures with monobank public keys.',
    setupChecklist: [
      'Generate merchant API tokens for live and test environments in your monobank acquiring cabinet.',
      'Configure the backend MonoPay webhook URL in the monobank acquiring settings.',
      'Save the merchant token for each environment in this school settings panel.',
      'Use test mode first to validate invoice creation, redirect flow, and webhook delivery.',
    ],
    fieldHelp: {
      mode: 'Choose whether new MonoPay invoices should be created with the live merchant token or the test merchant token.',
      'monopay.liveToken':
        'monobank acquiring cabinet -> integration or API settings -> copy the live merchant token used for invoice/create requests.',
      'monopay.testToken':
        'monobank acquiring cabinet -> test environment / sandbox credentials -> copy the test merchant token.',
    },
  },
  paypal: {
    title: 'PayPal',
    description: 'PayPal Checkout via Orders API and verified webhooks.',
    docsUrl: 'https://developer.paypal.com/docs/api/orders/v2/',
    docsLabel: 'PayPal Orders API docs',
    supportsModeSwitch: true,
    modeHelp:
      'PayPal uses separate sandbox and live apps. Each environment has its own client ID, client secret, and webhook ID for verification.',
    setupChecklist: [
      'Create a sandbox app and a live app in the PayPal Developer Dashboard.',
      'Copy the client ID for each environment into these settings.',
      'Save the client secret and webhook ID for each environment in this school settings panel.',
      'Register a webhook in each environment that points to your backend PayPal webhook URL and includes checkout / capture events.',
    ],
    fieldHelp: {
      mode: 'Choose whether the backend should create PayPal orders against the sandbox API or the live API.',
      'paypal.liveClientId':
        'PayPal Developer Dashboard -> My Apps & Credentials -> Live -> open your app -> copy the Client ID.',
      'paypal.testClientId':
        'PayPal Developer Dashboard -> My Apps & Credentials -> Sandbox -> open your app -> copy the Client ID.',
      'paypal.liveClientSecret':
        'PayPal Developer Dashboard -> My Apps & Credentials -> Live -> open your app -> reveal and copy the Secret.',
      'paypal.liveWebhookId':
        'PayPal Developer Dashboard -> Webhooks -> open the live webhook for this app -> copy the Webhook ID.',
      'paypal.testClientSecret':
        'PayPal Developer Dashboard -> My Apps & Credentials -> Sandbox -> open your app -> reveal and copy the Secret.',
      'paypal.testWebhookId':
        'PayPal Developer Dashboard -> Webhooks -> open the sandbox webhook for this app -> copy the Webhook ID.',
    },
  },
};

export function resolvePaymentProviderUiMeta(
  method: PaymentMethodKindDto,
  t?: TranslateFn,
): Pick<PaymentProviderMeta, 'title' | 'description' | 'setupChecklist'> {
  const meta = PAYMENT_PROVIDER_META[method];
  if (method !== 'manual_invoice' || !t) {
    return {
      title: meta.title,
      description: meta.description,
      setupChecklist: meta.setupChecklist,
    };
  }
  return {
    title: t('system.payments.manualInvoice.title'),
    description: t('system.payments.manualInvoice.description'),
    setupChecklist: [
      t('system.payments.manualInvoice.checklist.addMethods'),
      t('system.payments.manualInvoice.checklist.fillDetails'),
      t('system.payments.manualInvoice.checklist.creditManually'),
    ],
  };
}
