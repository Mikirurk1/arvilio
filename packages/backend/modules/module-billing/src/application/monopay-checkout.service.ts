import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type { CreateLessonPurchaseCheckoutRequestDto, LessonPurchaseCheckoutDto } from '@pkg/types';
import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';
import { getMonoPayRuntimeConfig, paymentMethodFromDto } from '../shared/payment-map.util';
import { assertProviderSupportsPackageCurrency } from '../shared/checkout-currency.util';
import {
  createMonoPayCheckout,
  fetchMonoPayPublicKey,
  monoPayCurrencyCodeFromIso,
  verifyMonoPaySignature,
} from '../infrastructure/monopay.client';

type MonoPayWebhookPayload = {
  invoiceId?: string;
  reference?: string;
  status?: string;
  failureReason?: string;
  [key: string]: unknown;
};

const MONOPAY_FAILED_STATUSES = new Set(['failure', 'reversed', 'expired', 'canceled']);

@Injectable()
export class MonoPayCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly paymentSettings: PaymentSettingsService,
    private readonly lessonBalance: LessonBalanceService,
  ) {}

  async createCheckout(
    userId: string,
    input: CreateLessonPurchaseCheckoutRequestDto,
  ): Promise<LessonPurchaseCheckoutDto> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const monoConfig = getMonoPayRuntimeConfig(settings.config, settings.secrets);
    if (!monoConfig.token) {
      throw new BadRequestException('MonoPay is not configured');
    }
    const available = await this.paymentSettings.resolveAvailableMethodsForStudent(userId);
    if (!available.includes('monopay') || input.method !== 'monopay') {
      throw new BadRequestException('MonoPay payment is not available');
    }

    const pkg = await this.paymentSettings.getPackageForCheckout(userId, input.packageId);
    if (!pkg) throw new BadRequestException('Package not found');
    assertProviderSupportsPackageCurrency('monopay', settings.config, pkg.currency);
    if (pkg.amountMinor <= 0) {
      throw new BadRequestException('Lesson price is not configured');
    }
    if (monoPayCurrencyCodeFromIso(pkg.currency) == null) {
      throw new BadRequestException(`MonoPay does not support currency ${pkg.currency}`);
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        method: paymentMethodFromDto('monopay'),
        status: 'PENDING',
        lessonsGranted: pkg.lessons,
        amountMinor: pkg.amountMinor,
        currency: pkg.currency,
        metadata: { creditTrack: pkg.creditTrack },
      },
    });

    const webBase = process.env['WEB_APP_URL']?.trim() || 'http://localhost:3000';
    const apiBase = (process.env['API_URL']?.trim() || 'http://localhost:3000/api').replace(/\/$/, '');
    const checkout = await createMonoPayCheckout({
      apiBaseUrl: monoConfig.apiBaseUrl,
      token: monoConfig.token,
      amountMinor: pkg.amountMinor,
      currency: pkg.currency,
      reference: payment.id,
      destination: pkg.label,
      comment: `${pkg.lessons} lessons for Arvilio balance top-up`,
      redirectUrl: `${webBase}/payment?status=success`,
      webHookUrl: `${apiBase}/billing/monopay/webhook`,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: checkout.invoiceId },
    });

    return { checkoutUrl: checkout.pageUrl };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const monoConfig = getMonoPayRuntimeConfig(settings.config, settings.secrets);
    if (!monoConfig.token) return;

    let publicKey = await fetchMonoPayPublicKey(monoConfig.apiBaseUrl, monoConfig.token);
    let verified = verifyMonoPaySignature(rawBody, signature, publicKey);
    if (!verified) {
      publicKey = await fetchMonoPayPublicKey(monoConfig.apiBaseUrl, monoConfig.token, true);
      verified = verifyMonoPaySignature(rawBody, signature, publicKey);
    }
    if (!verified) {
      throw new BadRequestException('Invalid MonoPay signature');
    }

    const payload = JSON.parse(rawBody.toString('utf8')) as MonoPayWebhookPayload;
    const invoiceId = payload['invoiceId']?.trim();
    const reference = payload['reference']?.trim();
    const status = payload['status']?.trim().toLowerCase();
    if (!invoiceId && !reference) return;

    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          ...(invoiceId ? [{ externalId: invoiceId }] : []),
          ...(reference ? [{ id: reference }] : []),
        ],
      },
    });
    if (!payment || payment.status === 'SUCCEEDED') return;

    if (status === 'success') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          externalId: invoiceId || payment.externalId,
          metadata: payload as object,
        },
      });

      await this.lessonBalance.grantPurchaseLessons({
        userId: payment.userId,
        lessons: payment.lessonsGranted,
        paymentId: payment.id,
      });
      return;
    }

    if (status && MONOPAY_FAILED_STATUSES.has(status) && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          externalId: invoiceId || payment.externalId,
          metadata: payload as object,
        },
      });
    }
  }
}
