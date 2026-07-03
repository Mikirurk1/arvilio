import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type { CreateLessonPurchaseCheckoutRequestDto, LessonPurchaseCheckoutDto } from '@pkg/types';
import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';
import { getPayPalRuntimeConfig, paymentMethodFromDto } from '../shared/payment-map.util';
import { assertProviderSupportsPackageCurrency } from '../shared/checkout-currency.util';
import {
  capturePayPalOrder,
  createPayPalOrder,
  verifyPayPalWebhookSignature,
} from '../infrastructure/paypal.client';

type PayPalWebhookPayload = {
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
  [key: string]: unknown;
};

type PayPalWebhookHeaders = {
  authAlgo?: string;
  certUrl?: string;
  transmissionId?: string;
  transmissionSig?: string;
  transmissionTime?: string;
};

function captureEventOrderId(payload: PayPalWebhookPayload): string | undefined {
  return payload.resource?.supplementary_data?.related_ids?.['order_id']?.trim();
}

function approvalEventOrderId(payload: PayPalWebhookPayload): string | undefined {
  return payload.resource?.['id']?.trim();
}

@Injectable()
export class PayPalCheckoutService {
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
    const payPalConfig = getPayPalRuntimeConfig(settings.config, settings.secrets);
    if (!payPalConfig.clientId || !payPalConfig.clientSecret) {
      throw new BadRequestException('PayPal is not configured');
    }
    const available = await this.paymentSettings.resolveAvailableMethodsForStudent(userId);
    if (!available.includes('paypal') || input.method !== 'paypal') {
      throw new BadRequestException('PayPal payment is not available');
    }

    const pkg = await this.paymentSettings.getPackageForCheckout(userId, input.packageId);
    if (!pkg) throw new BadRequestException('Package not found');
    assertProviderSupportsPackageCurrency('paypal', settings.config, pkg.currency);
    if (pkg.amountMinor <= 0) {
      throw new BadRequestException('Lesson price is not configured');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        method: paymentMethodFromDto('paypal'),
        status: 'PENDING',
        lessonsGranted: pkg.lessons,
        amountMinor: pkg.amountMinor,
        currency: pkg.currency,
        metadata: { creditTrack: pkg.creditTrack },
      },
    });

    const webBase = process.env['WEB_APP_URL']?.trim() || 'http://localhost:3000';
    const order = await createPayPalOrder({
      apiBaseUrl: payPalConfig.apiBaseUrl,
      clientId: payPalConfig.clientId,
      clientSecret: payPalConfig.clientSecret,
      amountMinor: pkg.amountMinor,
      currency: pkg.currency,
      title: pkg.label,
      description: `${pkg.lessons} lessons for SoEnglish balance top-up`,
      customId: payment.id,
      returnUrl: `${webBase}/payment?status=success`,
      cancelUrl: `${webBase}/payment?status=cancelled`,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: order.orderId },
    });

    return { checkoutUrl: order.approvalUrl };
  }

  async handleWebhook(rawBody: string, headers: PayPalWebhookHeaders): Promise<void> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const payPalConfig = getPayPalRuntimeConfig(settings.config, settings.secrets);
    if (!payPalConfig.clientId || !payPalConfig.clientSecret || !payPalConfig.webhookId) return;

    const payload = JSON.parse(rawBody) as PayPalWebhookPayload;
    const verified = await verifyPayPalWebhookSignature({
      apiBaseUrl: payPalConfig.apiBaseUrl,
      clientId: payPalConfig.clientId,
      clientSecret: payPalConfig.clientSecret,
      webhookId: payPalConfig.webhookId,
      headers,
      event: payload as Record<string, unknown>,
    });
    if (!verified) {
      throw new BadRequestException('Invalid PayPal webhook signature');
    }

    if (payload['event_type'] === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = approvalEventOrderId(payload);
      if (!orderId) return;
      const payment = await this.prisma.payment.findUnique({ where: { externalId: orderId } });
      if (!payment || payment.status === 'SUCCEEDED') return;

      const capture = await capturePayPalOrder({
        apiBaseUrl: payPalConfig.apiBaseUrl,
        clientId: payPalConfig.clientId,
        clientSecret: payPalConfig.clientSecret,
        orderId,
      });

      if (String(capture['status'] ?? '').toUpperCase() === 'COMPLETED') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCEEDED',
            metadata: capture as Prisma.InputJsonValue,
          },
        });
        await this.lessonBalance.grantPurchaseLessons({
          userId: payment.userId,
          lessons: payment.lessonsGranted,
          paymentId: payment.id,
        });
        return;
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          metadata: payload as Prisma.InputJsonValue,
        },
      });
      return;
    }

    if (payload['event_type'] === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = captureEventOrderId(payload);
      if (!orderId) return;
      const payment = await this.prisma.payment.findUnique({ where: { externalId: orderId } });
      if (!payment || payment.status === 'SUCCEEDED') return;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          metadata: payload as Prisma.InputJsonValue,
        },
      });
      await this.lessonBalance.grantPurchaseLessons({
        userId: payment.userId,
        lessons: payment.lessonsGranted,
        paymentId: payment.id,
      });
      return;
    }

    if (payload['event_type'] === 'PAYMENT.CAPTURE.DENIED') {
      const orderId = captureEventOrderId(payload);
      if (!orderId) return;
      const payment = await this.prisma.payment.findUnique({ where: { externalId: orderId } });
      if (!payment || payment.status !== 'PENDING') return;
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: payload as Prisma.InputJsonValue,
        },
      });
    }
  }
}
