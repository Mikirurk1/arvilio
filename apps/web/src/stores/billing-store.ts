'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  DEFAULT_ALLOWED_CURRENCIES,
  DEFAULT_PAYMENT_ENVIRONMENT_MODE,
  DEFAULT_MIN_PACKAGE_LESSONS,
  DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
  normalizePricePerLessonByCurrency,
  type SchoolGroupLessonsSettingsDto,
  type LessonPriceByCurrencyDto,
  type PaymentCurrencyCode,
  type AdjustStudentLessonBalanceRequestDto,
  type CreateLessonPurchaseCheckoutRequestDto,
  type PaymentMethodKindDto,
  type PaymentSettingsDto,
  type StudentLessonBalanceDto,
  type UpdatePaymentSettingsRequestDto,
  type UpdateStudentLessonBillingRequestDto,
  type UpdateStudentLessonPricingRequestDto,
} from '@pkg/types';
import {
  ADJUST_STUDENT_LESSON_BALANCE,
  CREATE_LESSON_PURCHASE_CHECKOUT,
  MY_LESSON_BALANCE,
  PAYMENT_SETTINGS,
  STUDENT_LESSON_BALANCE,
  UPDATE_PAYMENT_SETTINGS,
  UPDATE_STUDENT_LESSON_BILLING,
  UPDATE_STUDENT_LESSON_PRICING,
} from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

function mapPaymentSettingsFromApi(raw: {
  enabledMethods: PaymentMethodKindDto[];
  methods: PaymentSettingsDto['methods'];
  secretStatuses: PaymentSettingsDto['secretStatuses'];
  config: {
    defaultPricePerLessonMinor: number;
    pricePerLessonByCurrency?: LessonPriceByCurrencyDto[];
    defaultCurrency: string;
    allowedCurrencies: string[];
    minPackageLessons: number;
    packages: PaymentSettingsDto['config']['packages'];
    manualInvoiceMethods: PaymentSettingsDto['config']['manualInvoiceMethods'];
    stripeMode?: 'live' | 'test' | null;
    stripeLivePublishableKey?: string | null;
    stripeTestPublishableKey?: string | null;
    liqpayMode?: 'live' | 'test' | null;
    liqpayLivePublicKey?: string | null;
    liqpayTestPublicKey?: string | null;
    wayforpayMode?: 'live' | 'test' | null;
    wayforpayLiveMerchantAccount?: string | null;
    wayforpayLiveMerchantDomainName?: string | null;
    wayforpayTestMerchantAccount?: string | null;
    wayforpayTestMerchantDomainName?: string | null;
    lemonsqueezyMode?: 'live' | 'test' | null;
    lemonsqueezyLiveStoreId?: string | null;
    lemonsqueezyLiveVariantId?: string | null;
    lemonsqueezyTestStoreId?: string | null;
    lemonsqueezyTestVariantId?: string | null;
    lemonsqueezyLiveVariantCurrency?: string | null;
    lemonsqueezyTestVariantCurrency?: string | null;
    paddleMode?: 'live' | 'test' | null;
    monopayMode?: 'live' | 'test' | null;
    paypalMode?: 'live' | 'test' | null;
    paypalLiveClientId?: string | null;
    paypalTestClientId?: string | null;
    groupLessons?: SchoolGroupLessonsSettingsDto | null;
  };
}): PaymentSettingsDto {
  const allowedCurrencies =
    raw.config.allowedCurrencies?.length > 0
      ? raw.config.allowedCurrencies
      : [...DEFAULT_ALLOWED_CURRENCIES];
  const defaultCurrency = allowedCurrencies.includes(raw.config.defaultCurrency)
    ? raw.config.defaultCurrency
    : allowedCurrencies[0];
  const pricePerLessonByCurrency = normalizePricePerLessonByCurrency({
    allowedCurrencies: allowedCurrencies as PaymentCurrencyCode[],
    defaultCurrency: defaultCurrency as PaymentCurrencyCode,
    defaultPricePerLessonMinor: raw.config.defaultPricePerLessonMinor,
    pricePerLessonByCurrency: raw.config.pricePerLessonByCurrency,
  });

  return {
    enabledMethods: raw.enabledMethods,
    methods: raw.methods,
    secretStatuses: raw.secretStatuses,
    config: {
      packages: raw.config.packages,
      defaultPricePerLessonMinor: raw.config.defaultPricePerLessonMinor,
      pricePerLessonByCurrency,
      defaultCurrency,
      allowedCurrencies,
      minPackageLessons: raw.config.minPackageLessons ?? DEFAULT_MIN_PACKAGE_LESSONS,
      manualInvoiceMethods: raw.config.manualInvoiceMethods ?? [],
      stripe: {
        mode: raw.config.stripeMode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        livePublishableKey: raw.config.stripeLivePublishableKey ?? undefined,
        testPublishableKey: raw.config.stripeTestPublishableKey ?? undefined,
      },
      liqpay: {
        mode: raw.config.liqpayMode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        livePublicKey: raw.config.liqpayLivePublicKey ?? undefined,
        testPublicKey: raw.config.liqpayTestPublicKey ?? undefined,
      },
      wayforpay: {
        mode: raw.config.wayforpayMode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        liveMerchantAccount: raw.config.wayforpayLiveMerchantAccount ?? undefined,
        liveMerchantDomainName: raw.config.wayforpayLiveMerchantDomainName ?? undefined,
        testMerchantAccount: raw.config.wayforpayTestMerchantAccount ?? undefined,
        testMerchantDomainName: raw.config.wayforpayTestMerchantDomainName ?? undefined,
      },
      lemonsqueezy: {
        mode: raw.config.lemonsqueezyMode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        liveStoreId: raw.config.lemonsqueezyLiveStoreId ?? undefined,
        liveVariantId: raw.config.lemonsqueezyLiveVariantId ?? undefined,
        liveVariantCurrency: raw.config.lemonsqueezyLiveVariantCurrency ?? undefined,
        testStoreId: raw.config.lemonsqueezyTestStoreId ?? undefined,
        testVariantId: raw.config.lemonsqueezyTestVariantId ?? undefined,
        testVariantCurrency: raw.config.lemonsqueezyTestVariantCurrency ?? undefined,
      },
      paddle: {
        mode: raw.config.paddleMode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
      },
      monopay: {
        mode: raw.config.monopayMode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
      },
      paypal: {
        mode: raw.config.paypalMode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        liveClientId: raw.config.paypalLiveClientId ?? undefined,
        testClientId: raw.config.paypalTestClientId ?? undefined,
      },
      groupLessons: raw.config.groupLessons ?? DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
    },
  };
}

type BillingState = {
  myBalance: AsyncSlice<StudentLessonBalanceDto>;
  paymentSettings: AsyncSlice<PaymentSettingsDto>;
  fetchMyBalance: (force?: boolean) => Promise<void>;
  fetchPaymentSettings: (force?: boolean) => Promise<void>;
  updatePaymentSettings: (input: UpdatePaymentSettingsRequestDto) => Promise<PaymentSettingsDto>;
  fetchStudentBalance: (studentId: string) => Promise<StudentLessonBalanceDto>;
  adjustStudentBalance: (
    input: AdjustStudentLessonBalanceRequestDto,
  ) => Promise<StudentLessonBalanceDto>;
  updateStudentLessonPricing: (
    input: UpdateStudentLessonPricingRequestDto,
  ) => Promise<StudentLessonBalanceDto>;
  updateStudentLessonBilling: (
    input: UpdateStudentLessonBillingRequestDto,
  ) => Promise<StudentLessonBalanceDto>;
  createCheckout: (input: CreateLessonPurchaseCheckoutRequestDto) => Promise<string>;
};

export const useBillingStore = create<BillingState>()(
  devtools(
    (set, get) => ({
      myBalance: createIdleSlice<StudentLessonBalanceDto>(),
      paymentSettings: createIdleSlice<PaymentSettingsDto>(),

      fetchMyBalance: async (force = false) => {
        const prev = get().myBalance;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ myBalance: sliceLoading(prev) }, false, 'billing/myBalance:start');
        try {
          const data = await graphqlRequest<{ myLessonBalance: StudentLessonBalanceDto }>(
            MY_LESSON_BALANCE,
          );
          set(
            { myBalance: sliceSuccess(prev, data.myLessonBalance) },
            false,
            'billing/myBalance:success',
          );
        } catch (error) {
          set({ myBalance: sliceError(prev, error) }, false, 'billing/myBalance:error');
        }
      },

      fetchPaymentSettings: async (force = false) => {
        const prev = get().paymentSettings;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ paymentSettings: sliceLoading(prev) }, false, 'billing/settings:start');
        try {
          const data = await graphqlRequest<{ paymentSettings: Parameters<typeof mapPaymentSettingsFromApi>[0] }>(
            PAYMENT_SETTINGS,
          );
          set(
            { paymentSettings: sliceSuccess(prev, mapPaymentSettingsFromApi(data.paymentSettings)) },
            false,
            'billing/settings:success',
          );
        } catch (error) {
          set({ paymentSettings: sliceError(prev, error) }, false, 'billing/settings:error');
        }
      },

      updatePaymentSettings: async (input) => {
        const data = await graphqlRequest<{
          updatePaymentSettings: Parameters<typeof mapPaymentSettingsFromApi>[0];
        }>(UPDATE_PAYMENT_SETTINGS, {
          input: {
            enabledMethods: input.enabledMethods,
            config: {
              packages: input.config.packages,
              defaultPricePerLessonMinor: input.config.defaultPricePerLessonMinor,
              pricePerLessonByCurrency: input.config.pricePerLessonByCurrency,
              defaultCurrency: input.config.defaultCurrency,
              allowedCurrencies: input.config.allowedCurrencies,
              minPackageLessons: input.config.minPackageLessons,
              manualInvoiceMethods: input.config.manualInvoiceMethods,
              stripeMode: input.config.stripe?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
              stripeLivePublishableKey: input.config.stripe?.livePublishableKey ?? null,
              stripeTestPublishableKey: input.config.stripe?.testPublishableKey ?? null,
              liqpayMode: input.config.liqpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
              liqpayLivePublicKey: input.config.liqpay?.livePublicKey ?? null,
              liqpayTestPublicKey: input.config.liqpay?.testPublicKey ?? null,
              wayforpayMode: input.config.wayforpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
              wayforpayLiveMerchantAccount: input.config.wayforpay?.liveMerchantAccount ?? null,
              wayforpayLiveMerchantDomainName:
                input.config.wayforpay?.liveMerchantDomainName ?? null,
              wayforpayTestMerchantAccount: input.config.wayforpay?.testMerchantAccount ?? null,
              wayforpayTestMerchantDomainName:
                input.config.wayforpay?.testMerchantDomainName ?? null,
              lemonsqueezyMode:
                input.config.lemonsqueezy?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
              lemonsqueezyLiveStoreId: input.config.lemonsqueezy?.liveStoreId ?? null,
              lemonsqueezyLiveVariantId: input.config.lemonsqueezy?.liveVariantId ?? null,
              lemonsqueezyTestStoreId: input.config.lemonsqueezy?.testStoreId ?? null,
              lemonsqueezyTestVariantId: input.config.lemonsqueezy?.testVariantId ?? null,
              lemonsqueezyLiveVariantCurrency: input.config.lemonsqueezy?.liveVariantCurrency ?? null,
              lemonsqueezyTestVariantCurrency: input.config.lemonsqueezy?.testVariantCurrency ?? null,
              paddleMode: input.config.paddle?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
              monopayMode: input.config.monopay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
              paypalMode: input.config.paypal?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
              paypalLiveClientId: input.config.paypal?.liveClientId ?? null,
              paypalTestClientId: input.config.paypal?.testClientId ?? null,
              groupLessons: input.config.groupLessons
                ? {
                    enabled: input.config.groupLessons.enabled,
                    defaultBillingMode: input.config.groupLessons.defaultBillingMode,
                    defaultPriceMinor: input.config.groupLessons.defaultPriceMinor,
                    defaultCurrency: input.config.groupLessons.defaultCurrency,
                    defaultSplitMode: input.config.groupLessons.defaultSplitMode,
                  }
                : null,
            },
            secrets: input.secrets
              ? {
                  stripe: input.secrets.stripe
                    ? {
                        liveSecretKey: input.secrets.stripe.liveSecretKey ?? null,
                        liveWebhookSecret: input.secrets.stripe.liveWebhookSecret ?? null,
                        testSecretKey: input.secrets.stripe.testSecretKey ?? null,
                        testWebhookSecret: input.secrets.stripe.testWebhookSecret ?? null,
                      }
                    : null,
                  liqpay: input.secrets.liqpay
                    ? {
                        livePrivateKey: input.secrets.liqpay.livePrivateKey ?? null,
                        testPrivateKey: input.secrets.liqpay.testPrivateKey ?? null,
                      }
                    : null,
                  wayforpay: input.secrets.wayforpay
                    ? {
                        liveSecretKey: input.secrets.wayforpay.liveSecretKey ?? null,
                        testSecretKey: input.secrets.wayforpay.testSecretKey ?? null,
                      }
                    : null,
                  lemonsqueezy: input.secrets.lemonsqueezy
                    ? {
                        liveApiKey: input.secrets.lemonsqueezy.liveApiKey ?? null,
                        liveWebhookSecret: input.secrets.lemonsqueezy.liveWebhookSecret ?? null,
                        testApiKey: input.secrets.lemonsqueezy.testApiKey ?? null,
                        testWebhookSecret: input.secrets.lemonsqueezy.testWebhookSecret ?? null,
                      }
                    : null,
                  paddle: input.secrets.paddle
                    ? {
                        liveApiKey: input.secrets.paddle.liveApiKey ?? null,
                        liveWebhookSecret: input.secrets.paddle.liveWebhookSecret ?? null,
                        testApiKey: input.secrets.paddle.testApiKey ?? null,
                        testWebhookSecret: input.secrets.paddle.testWebhookSecret ?? null,
                      }
                    : null,
                  monopay: input.secrets.monopay
                    ? {
                        liveToken: input.secrets.monopay.liveToken ?? null,
                        testToken: input.secrets.monopay.testToken ?? null,
                      }
                    : null,
                  paypal: input.secrets.paypal
                    ? {
                        liveClientSecret: input.secrets.paypal.liveClientSecret ?? null,
                        liveWebhookId: input.secrets.paypal.liveWebhookId ?? null,
                        testClientSecret: input.secrets.paypal.testClientSecret ?? null,
                        testWebhookId: input.secrets.paypal.testWebhookId ?? null,
                      }
                    : null,
                }
              : null,
          },
        });
        const mapped = mapPaymentSettingsFromApi(data.updatePaymentSettings);
        const prev = get().paymentSettings;
        set({ paymentSettings: sliceSuccess(prev, mapped) }, false, 'billing/settings:updated');
        return mapped;
      },

      fetchStudentBalance: async (studentId) => {
        const data = await graphqlRequest<{ studentLessonBalance: StudentLessonBalanceDto }>(
          STUDENT_LESSON_BALANCE,
          { studentId },
        );
        return data.studentLessonBalance;
      },

      adjustStudentBalance: async (input) => {
        const data = await graphqlRequest<{
          adjustStudentLessonBalance: StudentLessonBalanceDto;
        }>(ADJUST_STUDENT_LESSON_BALANCE, { input });
        return data.adjustStudentLessonBalance;
      },

      updateStudentLessonPricing: async (input) => {
        const data = await graphqlRequest<{
          updateStudentLessonPricing: StudentLessonBalanceDto;
        }>(UPDATE_STUDENT_LESSON_PRICING, { input });
        return data.updateStudentLessonPricing;
      },

      updateStudentLessonBilling: async (input) => {
        const data = await graphqlRequest<{
          updateStudentLessonBilling: StudentLessonBalanceDto;
        }>(UPDATE_STUDENT_LESSON_BILLING, { input });
        return data.updateStudentLessonBilling;
      },

      createCheckout: async (input) => {
        const data = await graphqlRequest<{
          createLessonPurchaseCheckout: { checkoutUrl: string };
        }>(CREATE_LESSON_PURCHASE_CHECKOUT, { input });
        return data.createLessonPurchaseCheckout.checkoutUrl;
      },
    }),
    { name: 'soenglish/billing' },
  ),
);

export const selectMyLessonBalance = (s: BillingState) => s.myBalance.data?.balance;
