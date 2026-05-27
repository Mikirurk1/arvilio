import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type {
  PaymentConfigDto,
  PaymentSecretStatusesDto,
  PaymentSecretsDto,
  PaymentMethodKindDto,
  PaymentSettingsDto,
  ResolvedLessonPackageDto,
  UpdatePaymentSettingsRequestDto,
} from '@pkg/types';
import {
  DEFAULT_MIN_PACKAGE_LESSONS,
  getPaymentSettingsCurrencyIssues,
} from '@pkg/types';
import {
  DEFAULT_PAYMENT_CONFIG,
  finalizePaymentConfig,
  getPaymentMethodStatuses,
  parsePaymentConfig,
  parseStudentPaymentMethodSelection,
  paymentConfigToJson,
  paymentMethodFromDto,
  paymentMethodToDto,
  resolveStudentPaymentMethods,
  validateStudentPaymentMethodSelection,
} from '../shared/payment-map.util';
import {
  decryptPaymentSecrets,
  emptyPaymentSecretStatuses,
  encryptPaymentSecrets,
  hasPaymentSecretUpdates,
  mergePaymentSecrets,
  secretStatus,
} from '../shared/payment-secrets.util';
import {
  billingModeToDto,
  parsePackageOverrides,
  resolveStudentPackages,
} from '../shared/student-billing-map.util';

const SETTINGS_ID = 'default';

@Injectable()
export class PaymentSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentSettings(): Promise<PaymentSettingsDto> {
    const runtime = await this.getRuntimePaymentSettings();
    return {
      enabledMethods: runtime.enabledMethods,
      config: runtime.config,
      methods: getPaymentMethodStatuses(runtime.config, runtime.enabledMethods, runtime.secrets),
      secretStatuses: this.buildPaymentSecretStatuses(runtime.secrets),
    };
  }

  async updatePaymentSettings(body: UpdatePaymentSettingsRequestDto): Promise<PaymentSettingsDto> {
    const row = await this.ensureSettingsRow();
    const enabled = body.enabledMethods.map(paymentMethodFromDto);
    const minLessons = Math.max(1, body.config.minPackageLessons ?? DEFAULT_PAYMENT_CONFIG.minPackageLessons);
    const methodIds = new Set<string>();
    for (const pkg of body.config.packages) {
      if (pkg.lessons < minLessons) {
        throw new BadRequestException(
          `Package "${pkg.label}" must have at least ${minLessons} lessons for student self-checkout`,
        );
      }
    }
    for (const method of body.config.manualInvoiceMethods) {
      const id = method.id.trim();
      if (!id) {
        throw new BadRequestException('Manual invoice methods must have an id');
      }
      if (methodIds.has(id)) {
        throw new BadRequestException(`Duplicate manual invoice method id: ${id}`);
      }
      methodIds.add(id);
    }
    const normalizedConfig = finalizePaymentConfig(body.config);
    const currencyIssues = getPaymentSettingsCurrencyIssues({
      enabledMethods: body.enabledMethods,
      config: normalizedConfig,
    });
    if (currencyIssues.length > 0) {
      throw new BadRequestException(currencyIssues.join(' '));
    }
    const configJson = paymentConfigToJson(normalizedConfig);
    const nextPaymentSecrets = this.buildUpdatedPaymentSecrets(row.paymentSecrets, body.secrets);
    await this.prisma.platformSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        enabledPaymentMethods: enabled,
        paymentConfig: configJson as Prisma.InputJsonValue,
        paymentSecrets: nextPaymentSecrets,
      },
    });
    return this.getPaymentSettings();
  }

  async getRuntimePaymentSettings(): Promise<{
    enabledMethods: PaymentMethodKindDto[];
    config: PaymentConfigDto;
    secrets: PaymentSecretsDto;
  }> {
    const row = await this.ensureSettingsRow();
    const config = parsePaymentConfig(row.paymentConfig);
    const enabledMethods = row.enabledPaymentMethods.map(paymentMethodToDto);
    const secrets = this.readStoredPaymentSecrets(row.paymentSecrets);
    return { enabledMethods, config, secrets };
  }

  async resolveAvailableMethodsForStudent(studentId: string): Promise<PaymentMethodKindDto[]> {
    const [settings, student] = await Promise.all([
      this.getPaymentSettings(),
      this.prisma.user.findUnique({
        where: { id: studentId },
        select: {
          role: true,
          lessonBalance: {
            select: { paymentMethodSelection: true },
          },
        },
      }),
    ]);
    if (!student || student.role !== 'STUDENT') return [];
    const enabled = settings.enabledMethods;
    const selection = validateStudentPaymentMethodSelection(
      enabled,
      parseStudentPaymentMethodSelection(student.lessonBalance?.paymentMethodSelection),
    );
    return resolveStudentPaymentMethods(enabled, selection);
  }

  async resolvePricePerLessonMinor(studentId: string): Promise<{
    defaultPricePerLessonMinor: number;
    pricePerLessonMinor: number | null;
    resolvedPricePerLessonMinor: number;
    isCustomPrice: boolean;
    defaultCurrency: string;
  }> {
    const settings = await this.getPaymentSettings();
    const defaultPrice = settings.config.defaultPricePerLessonMinor;
    await this.prisma.studentLessonBalance.upsert({
      where: { userId: studentId },
      create: { userId: studentId, balance: 0 },
      update: {},
    });
    const balance = await this.prisma.studentLessonBalance.findUnique({
      where: { userId: studentId },
      select: { pricePerLessonMinor: true },
    });
    const override = balance?.pricePerLessonMinor ?? null;
    const resolved =
      override != null && override >= 0 ? override : defaultPrice;
    return {
      defaultPricePerLessonMinor: defaultPrice,
      pricePerLessonMinor: override,
      resolvedPricePerLessonMinor: resolved,
      isCustomPrice: override != null,
      defaultCurrency: settings.config.defaultCurrency,
    };
  }

  async resolvePackagesForStudent(studentId: string): Promise<ResolvedLessonPackageDto[]> {
    const settings = await this.getPaymentSettings();
    const pricing = await this.resolvePricePerLessonMinor(studentId);
    const balance = await this.prisma.studentLessonBalance.findUnique({
      where: { userId: studentId },
      select: { billingMode: true, packageOverrides: true },
    });
    const billingMode = billingModeToDto(balance?.billingMode ?? 'BOTH');
    const overrides = parsePackageOverrides(balance?.packageOverrides);
    return resolveStudentPackages(
      settings.config,
      pricing.resolvedPricePerLessonMinor,
      pricing.isCustomPrice,
      billingMode,
      overrides,
    );
  }

  async getPackageForCheckout(
    studentId: string,
    packageId: string,
  ): Promise<ResolvedLessonPackageDto | null> {
    const packages = await this.resolvePackagesForStudent(studentId);
    return packages.find((p) => p.id === packageId) ?? null;
  }

  /** @deprecated use getPackageForCheckout */
  async getPackageById(packageId: string): Promise<PaymentConfigDto['packages'][number] | null> {
    const settings = await this.getPaymentSettings();
    return settings.config.packages.find((p) => p.id === packageId) ?? null;
  }

  private async ensureSettingsRow() {
    const existing = await this.prisma.platformSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (existing) return existing;
    try {
      return await this.prisma.platformSettings.create({
        data: { id: SETTINGS_ID },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.platformSettings.findUniqueOrThrow({
          where: { id: SETTINGS_ID },
        });
      }
      throw error;
    }
  }

  private readStoredPaymentSecrets(encryptedPayload: string | null): PaymentSecretsDto {
    if (!encryptedPayload) return {};
    const key = process.env['PAYMENT_SECRETS_ENCRYPTION_KEY']?.trim();
    if (!key) {
      throw new InternalServerErrorException(
        'PAYMENT_SECRETS_ENCRYPTION_KEY is required to read stored payment secrets',
      );
    }
    try {
      return decryptPaymentSecrets(encryptedPayload, key);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to decrypt stored payment secrets: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private buildUpdatedPaymentSecrets(
    currentEncryptedPayload: string | null,
    updates?: PaymentSecretsDto,
  ): string | null {
    if (!hasPaymentSecretUpdates(updates)) {
      return currentEncryptedPayload;
    }
    const key = process.env['PAYMENT_SECRETS_ENCRYPTION_KEY']?.trim();
    if (!key) {
      throw new BadRequestException(
        'PAYMENT_SECRETS_ENCRYPTION_KEY is required to save school payment secrets',
      );
    }
    const current = currentEncryptedPayload
      ? this.readStoredPaymentSecrets(currentEncryptedPayload)
      : {};
    return encryptPaymentSecrets(mergePaymentSecrets(current, updates), key);
  }

  private buildPaymentSecretStatuses(storedSecrets: PaymentSecretsDto): PaymentSecretStatusesDto {
    const env = (key: string) => process.env[key]?.trim() || undefined;
    const statuses = emptyPaymentSecretStatuses();
    statuses.stripe.liveSecretKey = secretStatus(
      storedSecrets.stripe?.liveSecretKey,
      env('STRIPE_LIVE_SECRET_KEY') ?? env('STRIPE_SECRET_KEY'),
    );
    statuses.stripe.liveWebhookSecret = secretStatus(
      storedSecrets.stripe?.liveWebhookSecret,
      env('STRIPE_LIVE_WEBHOOK_SECRET') ?? env('STRIPE_WEBHOOK_SECRET'),
    );
    statuses.stripe.testSecretKey = secretStatus(
      storedSecrets.stripe?.testSecretKey,
      env('STRIPE_TEST_SECRET_KEY'),
    );
    statuses.stripe.testWebhookSecret = secretStatus(
      storedSecrets.stripe?.testWebhookSecret,
      env('STRIPE_TEST_WEBHOOK_SECRET'),
    );

    statuses.liqpay.livePrivateKey = secretStatus(
      storedSecrets.liqpay?.livePrivateKey,
      env('LIQPAY_LIVE_PRIVATE_KEY') ?? env('LIQPAY_PRIVATE_KEY'),
    );
    statuses.liqpay.testPrivateKey = secretStatus(
      storedSecrets.liqpay?.testPrivateKey,
      env('LIQPAY_TEST_PRIVATE_KEY'),
    );

    statuses.wayforpay.liveSecretKey = secretStatus(
      storedSecrets.wayforpay?.liveSecretKey,
      env('WAYFORPAY_LIVE_SECRET_KEY') ?? env('WAYFORPAY_SECRET_KEY'),
    );
    statuses.wayforpay.testSecretKey = secretStatus(
      storedSecrets.wayforpay?.testSecretKey,
      env('WAYFORPAY_TEST_SECRET_KEY'),
    );

    statuses.lemonsqueezy.liveApiKey = secretStatus(
      storedSecrets.lemonsqueezy?.liveApiKey,
      env('LEMONSQUEEZY_LIVE_API_KEY') ?? env('LEMONSQUEEZY_API_KEY'),
    );
    statuses.lemonsqueezy.liveWebhookSecret = secretStatus(
      storedSecrets.lemonsqueezy?.liveWebhookSecret,
      env('LEMONSQUEEZY_LIVE_WEBHOOK_SECRET') ?? env('LEMONSQUEEZY_WEBHOOK_SECRET'),
    );
    statuses.lemonsqueezy.testApiKey = secretStatus(
      storedSecrets.lemonsqueezy?.testApiKey,
      env('LEMONSQUEEZY_TEST_API_KEY'),
    );
    statuses.lemonsqueezy.testWebhookSecret = secretStatus(
      storedSecrets.lemonsqueezy?.testWebhookSecret,
      env('LEMONSQUEEZY_TEST_WEBHOOK_SECRET'),
    );

    statuses.paddle.liveApiKey = secretStatus(
      storedSecrets.paddle?.liveApiKey,
      env('PADDLE_LIVE_API_KEY') ?? env('PADDLE_API_KEY'),
    );
    statuses.paddle.liveWebhookSecret = secretStatus(
      storedSecrets.paddle?.liveWebhookSecret,
      env('PADDLE_LIVE_WEBHOOK_SECRET') ?? env('PADDLE_WEBHOOK_SECRET'),
    );
    statuses.paddle.testApiKey = secretStatus(
      storedSecrets.paddle?.testApiKey,
      env('PADDLE_TEST_API_KEY'),
    );
    statuses.paddle.testWebhookSecret = secretStatus(
      storedSecrets.paddle?.testWebhookSecret,
      env('PADDLE_TEST_WEBHOOK_SECRET'),
    );

    statuses.monopay.liveToken = secretStatus(
      storedSecrets.monopay?.liveToken,
      env('MONOPAY_LIVE_TOKEN') ?? env('MONOPAY_TOKEN'),
    );
    statuses.monopay.testToken = secretStatus(
      storedSecrets.monopay?.testToken,
      env('MONOPAY_TEST_TOKEN'),
    );

    statuses.paypal.liveClientSecret = secretStatus(
      storedSecrets.paypal?.liveClientSecret,
      env('PAYPAL_LIVE_CLIENT_SECRET') ?? env('PAYPAL_CLIENT_SECRET'),
    );
    statuses.paypal.liveWebhookId = secretStatus(
      storedSecrets.paypal?.liveWebhookId,
      env('PAYPAL_LIVE_WEBHOOK_ID') ?? env('PAYPAL_WEBHOOK_ID'),
    );
    statuses.paypal.testClientSecret = secretStatus(
      storedSecrets.paypal?.testClientSecret,
      env('PAYPAL_TEST_CLIENT_SECRET'),
    );
    statuses.paypal.testWebhookId = secretStatus(
      storedSecrets.paypal?.testWebhookId,
      env('PAYPAL_TEST_WEBHOOK_ID'),
    );

    return statuses;
  }
}
