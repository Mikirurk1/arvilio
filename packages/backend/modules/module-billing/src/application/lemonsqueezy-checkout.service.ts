import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { CreateLessonPurchaseCheckoutRequestDto, LessonPurchaseCheckoutDto } from '@pkg/types';
import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';
import { getLemonSqueezyRuntimeConfig, paymentMethodFromDto } from '../shared/payment-map.util';
import { assertProviderSupportsPackageCurrency } from '../shared/checkout-currency.util';
import {
  createLemonSqueezyCheckout,
  verifyLemonSqueezySignature,
} from '../infrastructure/lemonsqueezy.client';

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      paymentId?: string;
      [key: string]: unknown;
    };
  };
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  };
};

@Injectable()
export class LemonSqueezyCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentSettings: PaymentSettingsService,
    private readonly lessonBalance: LessonBalanceService,
  ) {}

  async createCheckout(
    userId: string,
    input: CreateLessonPurchaseCheckoutRequestDto,
  ): Promise<LessonPurchaseCheckoutDto> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const lemonConfig = getLemonSqueezyRuntimeConfig(settings.config, settings.secrets);
    const apiKey = lemonConfig.apiKey;
    if (!apiKey) {
      throw new BadRequestException('Lemon Squeezy is not configured');
    }
    const available = await this.paymentSettings.resolveAvailableMethodsForStudent(userId);
    if (!available.includes('lemonsqueezy') || input.method !== 'lemonsqueezy') {
      throw new BadRequestException('Lemon Squeezy payment is not available');
    }
    const storeId = lemonConfig.storeId;
    const variantId = lemonConfig.variantId;
    if (!storeId || !variantId) {
      throw new BadRequestException('Lemon Squeezy settings are incomplete');
    }

    const pkg = await this.paymentSettings.getPackageForCheckout(userId, input.packageId);
    if (!pkg) throw new BadRequestException('Package not found');
    assertProviderSupportsPackageCurrency('lemonsqueezy', settings.config, pkg.currency);
    if (pkg.amountMinor <= 0) {
      throw new BadRequestException('Lesson price is not configured');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        method: paymentMethodFromDto('lemonsqueezy'),
        status: 'PENDING',
        lessonsGranted: pkg.lessons,
        amountMinor: pkg.amountMinor,
        currency: pkg.currency,
      },
    });

    const webBase = process.env['WEB_APP_URL']?.trim() || 'http://localhost:3000';
    const checkout = await createLemonSqueezyCheckout({
      apiKey,
      storeId,
      variantId,
      amountMinor: pkg.amountMinor,
      checkoutName: pkg.label,
      checkoutDescription: `${pkg.lessons} lessons for SoEnglish balance top-up`,
      redirectUrl: `${webBase}/payment?status=success`,
      customData: {
        paymentId: payment.id,
        userId,
        packageId: pkg.id,
        lessonsGranted: String(pkg.lessons),
      },
      testMode: lemonConfig.testMode,
      email: student?.email ?? undefined,
      name: student?.displayName ?? undefined,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: checkout.id },
    });

    return { checkoutUrl: checkout.url };
  }

  async handleWebhook(rawBody: string, signature: string | undefined): Promise<void> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const secret = getLemonSqueezyRuntimeConfig(settings.config, settings.secrets).webhookSecret;
    if (!secret) return;
    if (!verifyLemonSqueezySignature(rawBody, signature, secret)) {
      throw new BadRequestException('Invalid Lemon Squeezy signature');
    }

    const payload = JSON.parse(rawBody) as LemonWebhookPayload;
    if (payload.meta?.['event_name'] !== 'order_created') return;

    const paymentId = payload.meta?.custom_data?.['paymentId']?.trim();
    if (!paymentId) return;

    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status === 'SUCCEEDED') return;

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCEEDED',
        externalId: payload.data?.['id']?.trim() || payment.externalId,
        metadata: payload as object,
      },
    });

    await this.lessonBalance.grantPurchaseLessons({
      userId: payment.userId,
      lessons: payment.lessonsGranted,
      paymentId: payment.id,
    });
  }
}
