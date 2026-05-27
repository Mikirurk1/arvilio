import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { CreateLessonPurchaseCheckoutRequestDto, LessonPurchaseCheckoutDto } from '@pkg/types';
import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';
import { getPaddleRuntimeConfig, paymentMethodFromDto } from '../shared/payment-map.util';
import { assertProviderSupportsPackageCurrency } from '../shared/checkout-currency.util';
import { createPaddleCheckout, verifyPaddleSignature } from '../infrastructure/paddle.client';

type PaddleWebhookPayload = {
  event_type?: string;
  data?: {
    id?: string;
    custom_data?: {
      paymentId?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

@Injectable()
export class PaddleCheckoutService {
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
    const paddleConfig = getPaddleRuntimeConfig(settings.config, settings.secrets);
    const apiKey = paddleConfig.apiKey;
    if (!apiKey) {
      throw new BadRequestException('Paddle is not configured');
    }
    const available = await this.paymentSettings.resolveAvailableMethodsForStudent(userId);
    if (!available.includes('paddle') || input.method !== 'paddle') {
      throw new BadRequestException('Paddle payment is not available');
    }

    const pkg = await this.paymentSettings.getPackageForCheckout(userId, input.packageId);
    if (!pkg) throw new BadRequestException('Package not found');
    assertProviderSupportsPackageCurrency('paddle', settings.config, pkg.currency);
    if (pkg.amountMinor <= 0) {
      throw new BadRequestException('Lesson price is not configured');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        method: paymentMethodFromDto('paddle'),
        status: 'PENDING',
        lessonsGranted: pkg.lessons,
        amountMinor: pkg.amountMinor,
        currency: pkg.currency,
      },
    });

    const webBase = process.env['WEB_APP_URL']?.trim() || 'http://localhost:3000';
    const checkout = await createPaddleCheckout({
      apiKey,
      apiBaseUrl: paddleConfig.apiBaseUrl,
      amountMinor: pkg.amountMinor,
      currency: pkg.currency,
      title: pkg.label,
      description: `${pkg.lessons} lessons for SoEnglish balance top-up`,
      redirectUrl: `${webBase}/payment?status=success`,
      customData: {
        paymentId: payment.id,
        userId,
        packageId: pkg.id,
        lessonsGranted: String(pkg.lessons),
      },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: checkout.id },
    });

    return { checkoutUrl: checkout.url };
  }

  async handleWebhook(rawBody: string, signature: string | undefined): Promise<void> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const secret = getPaddleRuntimeConfig(settings.config, settings.secrets).webhookSecret;
    if (!secret) return;
    if (!verifyPaddleSignature(rawBody, signature, secret)) {
      throw new BadRequestException('Invalid Paddle signature');
    }

    const payload = JSON.parse(rawBody) as PaddleWebhookPayload;
    if (payload['event_type'] !== 'transaction.completed' && payload['event_type'] !== 'transaction.paid') {
      return;
    }

    const paymentId = payload.data?.custom_data?.['paymentId']?.trim();
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
