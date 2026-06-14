import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard, Roles, RolesGuard } from '@be/auth';
import { PrismaService } from '@be/prisma';
import {
  AdjustStudentLessonBalanceInput,
  CreateLessonPurchaseCheckoutInput,
  LessonPurchaseCheckoutType,
  PaymentConfigType,
  PaymentSettingsType,
  SchoolGroupLessonsSettingsType,
  StudentLessonBalanceType,
  UpdatePaymentSettingsInput,
  UpdateStudentLessonBillingInput,
  UpdateStudentLessonPricingInput,
} from '@be/graphql';
import { LemonSqueezyCheckoutService } from '../../application/lemonsqueezy-checkout.service';
import { LessonBalanceService } from '../../application/lesson-balance.service';
import { LiqPayCheckoutService } from '../../application/liqpay-checkout.service';
import { MonoPayCheckoutService } from '../../application/monopay-checkout.service';
import { PaddleCheckoutService } from '../../application/paddle-checkout.service';
import { PayPalCheckoutService } from '../../application/paypal-checkout.service';
import { PaymentSettingsService } from '../../application/payment-settings.service';
import { StripeCheckoutService } from '../../application/stripe-checkout.service';
import { WayForPayCheckoutService } from '../../application/wayforpay-checkout.service';
import {
  isPaymentCurrencyCode,
  type ManualInvoiceCardMethodDto,
  type ManualInvoiceCustomMethodDto,
  type ManualInvoiceIbanMethodDto,
  type ManualInvoiceMethodDto,
  type ManualInvoiceMethodKindDto,
  type ManualInvoiceSwiftMethodDto,
  type PaymentMethodKindDto,
} from '@pkg/types';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class BillingResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentSettings: PaymentSettingsService,
    private readonly lessonBalance: LessonBalanceService,
    private readonly stripeCheckout: StripeCheckoutService,
    private readonly liqpayCheckout: LiqPayCheckoutService,
    private readonly wayforpayCheckout: WayForPayCheckoutService,
    private readonly lemonsqueezyCheckout: LemonSqueezyCheckoutService,
    private readonly paddleCheckout: PaddleCheckoutService,
    private readonly monoPayCheckout: MonoPayCheckoutService,
    private readonly payPalCheckout: PayPalCheckoutService,
  ) {}

  @Query(() => StudentLessonBalanceType, { name: 'myLessonBalance' })
  @Roles('STUDENT')
  async myLessonBalance(@CurrentGqlUser() userId: string) {
    return this.lessonBalance.getMyBalance(userId);
  }

  @Query(() => StudentLessonBalanceType, { name: 'studentLessonBalance' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  async studentLessonBalance(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
  ) {
    const actor = await this.resolveStaffRole(userId);
    return this.lessonBalance.getStudentBalance(actor, studentId);
  }

  @Query(() => PaymentSettingsType, { name: 'paymentSettings' })
  @Roles('SUPER_ADMIN')
  async getPaymentSettings() {
    const settings = await this.paymentSettings.getPaymentSettings();
    return toPaymentSettingsType(settings);
  }

  @Query(() => SchoolGroupLessonsSettingsType, { name: 'schoolGroupLessonsSettings' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  async schoolGroupLessonsSettings() {
    const { config } = await this.paymentSettings.getRuntimePaymentSettings();
    const groupLessons = config.groupLessons!;
    return {
      enabled: groupLessons.enabled,
      defaultBillingMode: groupLessons.defaultBillingMode,
      defaultPriceMinor: groupLessons.defaultPriceMinor,
      defaultCurrency: groupLessons.defaultCurrency,
      defaultSplitMode: groupLessons.defaultSplitMode,
    };
  }

  @Mutation(() => PaymentSettingsType, { name: 'updatePaymentSettings' })
  @Roles('SUPER_ADMIN')
  async updatePaymentSettings(@Args('input') input: UpdatePaymentSettingsInput) {
    const settings = await this.paymentSettings.updatePaymentSettings({
      enabledMethods: input.enabledMethods as PaymentMethodKindDto[],
      config: {
        packages: input.config.packages.map((p) => ({
          id: p.id,
          lessons: p.lessons,
          label: p.label,
          currency: p.currency ?? undefined,
        })),
        defaultPricePerLessonMinor: input.config.defaultPricePerLessonMinor,
        pricePerLessonByCurrency: (input.config.pricePerLessonByCurrency ?? [])
          .map((row) => {
            const currency = row.currency.trim().toUpperCase();
            if (!isPaymentCurrencyCode(currency)) return null;
            return {
              currency,
              pricePerLessonMinor: row.pricePerLessonMinor,
            };
          })
          .filter((row): row is import('@pkg/types').LessonPriceByCurrencyDto => row != null),
        defaultCurrency: input.config.defaultCurrency,
        allowedCurrencies: input.config.allowedCurrencies,
        minPackageLessons: input.config.minPackageLessons,
        manualInvoiceMethods: input.config.manualInvoiceMethods.map(mapManualInvoiceMethodInput),
        stripe: {
          mode:
            (input.config.stripeMode as import('@pkg/types').PaymentEnvironmentModeDto | null) ??
            'live',
          livePublishableKey: input.config.stripeLivePublishableKey ?? undefined,
          testPublishableKey: input.config.stripeTestPublishableKey ?? undefined,
        },
        liqpay: {
          mode:
            (input.config.liqpayMode as import('@pkg/types').PaymentEnvironmentModeDto | null) ??
            'live',
          livePublicKey: input.config.liqpayLivePublicKey ?? undefined,
          testPublicKey: input.config.liqpayTestPublicKey ?? undefined,
        },
        wayforpay: {
          mode:
            (input.config.wayforpayMode as import('@pkg/types').PaymentEnvironmentModeDto | null) ??
            'live',
          liveMerchantAccount: input.config.wayforpayLiveMerchantAccount ?? undefined,
          liveMerchantDomainName: input.config.wayforpayLiveMerchantDomainName ?? undefined,
          testMerchantAccount: input.config.wayforpayTestMerchantAccount ?? undefined,
          testMerchantDomainName: input.config.wayforpayTestMerchantDomainName ?? undefined,
        },
        lemonsqueezy: {
          mode:
            (input.config.lemonsqueezyMode as import('@pkg/types').PaymentEnvironmentModeDto | null) ??
            'live',
          liveStoreId: input.config.lemonsqueezyLiveStoreId ?? undefined,
          liveVariantId: input.config.lemonsqueezyLiveVariantId ?? undefined,
          liveVariantCurrency: input.config.lemonsqueezyLiveVariantCurrency ?? undefined,
          testStoreId: input.config.lemonsqueezyTestStoreId ?? undefined,
          testVariantId: input.config.lemonsqueezyTestVariantId ?? undefined,
          testVariantCurrency: input.config.lemonsqueezyTestVariantCurrency ?? undefined,
        },
        paddle: {
          mode:
            (input.config.paddleMode as import('@pkg/types').PaymentEnvironmentModeDto | null) ??
            'live',
        },
        monopay: {
          mode:
            (input.config.monopayMode as import('@pkg/types').PaymentEnvironmentModeDto | null) ??
            'live',
        },
        paypal: {
          mode:
            (input.config.paypalMode as import('@pkg/types').PaymentEnvironmentModeDto | null) ??
            'live',
          liveClientId: input.config.paypalLiveClientId ?? undefined,
          testClientId: input.config.paypalTestClientId ?? undefined,
        },
        groupLessons: input.config.groupLessons
          ? {
              enabled: input.config.groupLessons.enabled,
              defaultBillingMode: input.config.groupLessons
                .defaultBillingMode as import('@pkg/types').GroupLessonBillingMode,
              defaultPriceMinor: input.config.groupLessons.defaultPriceMinor,
              defaultCurrency: input.config.groupLessons.defaultCurrency,
              defaultSplitMode: input.config.groupLessons
                .defaultSplitMode as import('@pkg/types').GroupFixedSplitMode,
            }
          : undefined,
      },
      secrets: input.secrets
        ? {
            stripe: input.secrets.stripe
              ? {
                  liveSecretKey: input.secrets.stripe.liveSecretKey ?? undefined,
                  liveWebhookSecret: input.secrets.stripe.liveWebhookSecret ?? undefined,
                  testSecretKey: input.secrets.stripe.testSecretKey ?? undefined,
                  testWebhookSecret: input.secrets.stripe.testWebhookSecret ?? undefined,
                }
              : undefined,
            liqpay: input.secrets.liqpay
              ? {
                  livePrivateKey: input.secrets.liqpay.livePrivateKey ?? undefined,
                  testPrivateKey: input.secrets.liqpay.testPrivateKey ?? undefined,
                }
              : undefined,
            wayforpay: input.secrets.wayforpay
              ? {
                  liveSecretKey: input.secrets.wayforpay.liveSecretKey ?? undefined,
                  testSecretKey: input.secrets.wayforpay.testSecretKey ?? undefined,
                }
              : undefined,
            lemonsqueezy: input.secrets.lemonsqueezy
              ? {
                  liveApiKey: input.secrets.lemonsqueezy.liveApiKey ?? undefined,
                  liveWebhookSecret: input.secrets.lemonsqueezy.liveWebhookSecret ?? undefined,
                  testApiKey: input.secrets.lemonsqueezy.testApiKey ?? undefined,
                  testWebhookSecret: input.secrets.lemonsqueezy.testWebhookSecret ?? undefined,
                }
              : undefined,
            paddle: input.secrets.paddle
              ? {
                  liveApiKey: input.secrets.paddle.liveApiKey ?? undefined,
                  liveWebhookSecret: input.secrets.paddle.liveWebhookSecret ?? undefined,
                  testApiKey: input.secrets.paddle.testApiKey ?? undefined,
                  testWebhookSecret: input.secrets.paddle.testWebhookSecret ?? undefined,
                }
              : undefined,
            monopay: input.secrets.monopay
              ? {
                  liveToken: input.secrets.monopay.liveToken ?? undefined,
                  testToken: input.secrets.monopay.testToken ?? undefined,
                }
              : undefined,
            paypal: input.secrets.paypal
              ? {
                  liveClientSecret: input.secrets.paypal.liveClientSecret ?? undefined,
                  liveWebhookId: input.secrets.paypal.liveWebhookId ?? undefined,
                  testClientSecret: input.secrets.paypal.testClientSecret ?? undefined,
                  testWebhookId: input.secrets.paypal.testWebhookId ?? undefined,
                }
              : undefined,
          }
        : undefined,
    });
    return toPaymentSettingsType(settings);
  }

  @Mutation(() => StudentLessonBalanceType, { name: 'updateStudentLessonPricing' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateStudentLessonPricing(
    @CurrentGqlUser() userId: string,
    @Args('input') input: UpdateStudentLessonPricingInput,
  ) {
    const actor = await this.resolveStaffRole(userId);
    return this.lessonBalance.updateStudentPricing(
      actor,
      input.studentId,
      input.pricePerLessonMinor ?? null,
      input.groupPricePerLessonMinor,
    );
  }

  @Mutation(() => StudentLessonBalanceType, { name: 'updateStudentLessonBilling' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateStudentLessonBilling(
    @CurrentGqlUser() userId: string,
    @Args('input') input: UpdateStudentLessonBillingInput,
  ) {
    const actor = await this.resolveStaffRole(userId);
    return this.lessonBalance.updateStudentBilling(actor, {
      studentId: input.studentId,
      billingMode: input.billingMode as import('@pkg/types').StudentBillingModeDto,
      packageOverrides: input.packageOverrides.map((o) => ({
        packageId: o.packageId,
        lessons: o.lessons ?? null,
        lessonsLocked: o.lessonsLocked === true,
        enabled: o.enabled !== false,
      })),
      paymentMethodSelection: {
        allowedMethods: input.paymentMethodSelection.allowedMethods as PaymentMethodKindDto[],
        restrictToAllowlistOnly: input.paymentMethodSelection.restrictToAllowlistOnly === true,
      },
      manualInvoiceSelection: {
        allowedMethodIds: input.manualInvoiceSelection.allowedMethodIds,
        defaultMethodId: input.manualInvoiceSelection.defaultMethodId ?? null,
      },
    });
  }

  @Mutation(() => StudentLessonBalanceType, { name: 'adjustStudentLessonBalance' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async adjustStudentLessonBalance(
    @CurrentGqlUser() userId: string,
    @Args('input') input: AdjustStudentLessonBalanceInput,
  ) {
    const actor = await this.resolveStaffRole(userId);
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Forbidden');
    }
    return this.lessonBalance.adjustBalance(actor, {
      studentId: input.studentId,
      lessons: input.lessons,
      note: input.note,
      creditTrack:
        input.creditTrack === 'group' || input.creditTrack === 'individual'
          ? input.creditTrack
          : undefined,
    });
  }

  @Mutation(() => LessonPurchaseCheckoutType, { name: 'createLessonPurchaseCheckout' })
  @Roles('STUDENT')
  async createLessonPurchaseCheckout(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateLessonPurchaseCheckoutInput,
  ) {
    const body = {
      method: input.method as PaymentMethodKindDto,
      packageId: input.packageId,
    };
    if (body.method === 'stripe') {
      return this.stripeCheckout.createCheckout(userId, body);
    }
    if (body.method === 'liqpay') {
      return this.liqpayCheckout.createCheckout(userId, body);
    }
    if (body.method === 'wayforpay') {
      return this.wayforpayCheckout.createCheckout(userId, body);
    }
    if (body.method === 'lemonsqueezy') {
      return this.lemonsqueezyCheckout.createCheckout(userId, body);
    }
    if (body.method === 'paddle') {
      return this.paddleCheckout.createCheckout(userId, body);
    }
    if (body.method === 'monopay') {
      return this.monoPayCheckout.createCheckout(userId, body);
    }
    if (body.method === 'paypal') {
      return this.payPalCheckout.createCheckout(userId, body);
    }
    throw new BadRequestException('Online checkout is not available for this method');
  }

  private async resolveStaffRole(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (
      !user ||
      (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')
    ) {
      throw new BadRequestException('Staff only');
    }
    return { id: userId, role: user.role as 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' };
  }
}

function toPaymentSettingsType(settings: Awaited<
  ReturnType<PaymentSettingsService['getPaymentSettings']>
>): PaymentSettingsType {
  return {
    enabledMethods: settings.enabledMethods,
    methods: settings.methods,
    secretStatuses: settings.secretStatuses,
    config: {
      packages: settings.config.packages,
      defaultPricePerLessonMinor: settings.config.defaultPricePerLessonMinor,
      pricePerLessonByCurrency: settings.config.pricePerLessonByCurrency,
      defaultCurrency: settings.config.defaultCurrency,
      allowedCurrencies: settings.config.allowedCurrencies,
      minPackageLessons: settings.config.minPackageLessons,
      manualInvoiceMethods: settings.config.manualInvoiceMethods,
      stripeMode: settings.config.stripe?.mode ?? null,
      stripeLivePublishableKey: settings.config.stripe?.livePublishableKey ?? null,
      stripeTestPublishableKey: settings.config.stripe?.testPublishableKey ?? null,
      liqpayMode: settings.config.liqpay?.mode ?? null,
      liqpayLivePublicKey: settings.config.liqpay?.livePublicKey ?? null,
      liqpayTestPublicKey: settings.config.liqpay?.testPublicKey ?? null,
      wayforpayMode: settings.config.wayforpay?.mode ?? null,
      wayforpayLiveMerchantAccount: settings.config.wayforpay?.liveMerchantAccount ?? null,
      wayforpayLiveMerchantDomainName: settings.config.wayforpay?.liveMerchantDomainName ?? null,
      wayforpayTestMerchantAccount: settings.config.wayforpay?.testMerchantAccount ?? null,
      wayforpayTestMerchantDomainName: settings.config.wayforpay?.testMerchantDomainName ?? null,
      lemonsqueezyMode: settings.config.lemonsqueezy?.mode ?? null,
      lemonsqueezyLiveStoreId: settings.config.lemonsqueezy?.liveStoreId ?? null,
      lemonsqueezyLiveVariantId: settings.config.lemonsqueezy?.liveVariantId ?? null,
      lemonsqueezyTestStoreId: settings.config.lemonsqueezy?.testStoreId ?? null,
      lemonsqueezyTestVariantId: settings.config.lemonsqueezy?.testVariantId ?? null,
      lemonsqueezyLiveVariantCurrency: settings.config.lemonsqueezy?.liveVariantCurrency ?? null,
      lemonsqueezyTestVariantCurrency: settings.config.lemonsqueezy?.testVariantCurrency ?? null,
      paddleMode: settings.config.paddle?.mode ?? null,
      monopayMode: settings.config.monopay?.mode ?? null,
      paypalMode: settings.config.paypal?.mode ?? null,
      paypalLiveClientId: settings.config.paypal?.liveClientId ?? null,
      paypalTestClientId: settings.config.paypal?.testClientId ?? null,
      groupLessons: settings.config.groupLessons
        ? {
            enabled: settings.config.groupLessons.enabled,
            defaultBillingMode: settings.config.groupLessons.defaultBillingMode,
            defaultPriceMinor: settings.config.groupLessons.defaultPriceMinor,
            defaultCurrency: settings.config.groupLessons.defaultCurrency,
            defaultSplitMode: settings.config.groupLessons.defaultSplitMode,
          }
        : null,
    } as PaymentConfigType,
  };
}

function mapManualInvoiceMethodInput(method: {
  kind: string;
  id: string;
  label: string;
  description: string;
  receiptHintUk: string;
  paymentReferenceHint: string;
  recipientTaxId?: string | null;
  paymentPurpose?: string | null;
  importantNotes?: string[] | null;
  beneficiaryName?: string | null;
  iban?: string | null;
  bankName?: string | null;
  bankCountry?: string | null;
  bic?: string | null;
  accountNumber?: string | null;
  bankAddress?: string | null;
  swiftBic?: string | null;
  beneficiaryAddress?: string | null;
  intermediaryBankName?: string | null;
  intermediarySwiftBic?: string | null;
  cardNumber?: string | null;
  instructionsUk?: string | null;
}): ManualInvoiceMethodDto {
  const base = {
    id: method.id,
    label: method.label,
    description: method.description,
    receiptHintUk: method.receiptHintUk,
    paymentReferenceHint: method.paymentReferenceHint,
    recipientTaxId: method.recipientTaxId ?? null,
    paymentPurpose: method.paymentPurpose ?? null,
    importantNotes: method.importantNotes ?? [],
  };

  if (method.kind === 'iban_sepa') {
    const mapped: ManualInvoiceIbanMethodDto = {
      ...base,
      kind: 'iban_sepa',
      beneficiaryName: method.beneficiaryName ?? '',
      iban: method.iban ?? '',
      bankName: method.bankName ?? null,
      bankCountry: method.bankCountry ?? null,
      bic: method.bic ?? null,
    };
    return mapped;
  }

  if (method.kind === 'swift_wire') {
    const mapped: ManualInvoiceSwiftMethodDto = {
      ...base,
      kind: 'swift_wire',
      beneficiaryName: method.beneficiaryName ?? '',
      accountNumber: method.accountNumber ?? '',
      iban: method.iban ?? null,
      bankName: method.bankName ?? null,
      bankAddress: method.bankAddress ?? null,
      swiftBic: method.swiftBic ?? '',
      beneficiaryAddress: method.beneficiaryAddress ?? null,
      intermediaryBankName: method.intermediaryBankName ?? null,
      intermediarySwiftBic: method.intermediarySwiftBic ?? null,
    };
    return mapped;
  }

  if (method.kind === 'card_transfer') {
    const mapped: ManualInvoiceCardMethodDto = {
      ...base,
      kind: 'card_transfer',
      beneficiaryName: method.beneficiaryName ?? '',
      bankName: method.bankName ?? '',
      cardNumber: method.cardNumber ?? '',
    };
    return mapped;
  }

  const mapped: ManualInvoiceCustomMethodDto = {
    ...base,
    kind: 'custom',
    instructionsUk: method.instructionsUk ?? '',
  };
  return mapped;
}
