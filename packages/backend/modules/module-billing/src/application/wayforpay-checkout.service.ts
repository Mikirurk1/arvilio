import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { CreateLessonPurchaseCheckoutRequestDto, LessonPurchaseCheckoutDto } from '@pkg/types';
import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';
import { getWayForPayRuntimeConfig, paymentMethodFromDto } from '../shared/payment-map.util';
import { assertProviderSupportsPackageCurrency } from '../shared/checkout-currency.util';
import {
  buildWayForPayAck,
  createWayForPayCheckout,
  normalizeWayForPayDomain,
  verifyWayForPayCallback,
  type WayForPayCallbackPayload,
} from '../infrastructure/wayforpay.client';

@Injectable()
export class WayForPayCheckoutService {
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
    const wayforpayConfig = getWayForPayRuntimeConfig(settings.config, settings.secrets);
    const secretKey = wayforpayConfig.secretKey;
    if (!secretKey) {
      throw new BadRequestException('WayForPay is not configured');
    }
    const available = await this.paymentSettings.resolveAvailableMethodsForStudent(userId);
    if (!available.includes('wayforpay') || input.method !== 'wayforpay') {
      throw new BadRequestException('WayForPay payment is not available');
    }
    const merchantAccount = wayforpayConfig.merchantAccount;
    const merchantDomainName = normalizeWayForPayDomain(
      wayforpayConfig.merchantDomainName,
    );
    if (!merchantAccount || !merchantDomainName) {
      throw new BadRequestException('WayForPay merchant settings are incomplete');
    }

    const pkg = await this.paymentSettings.getPackageForCheckout(userId, input.packageId);
    if (!pkg) throw new BadRequestException('Package not found');
    assertProviderSupportsPackageCurrency('wayforpay', settings.config, pkg.currency);
    if (pkg.amountMinor <= 0) {
      throw new BadRequestException('Lesson price is not configured');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        method: paymentMethodFromDto('wayforpay'),
        status: 'PENDING',
        lessonsGranted: pkg.lessons,
        amountMinor: pkg.amountMinor,
        currency: pkg.currency,
      },
    });

    const webBase = process.env['WEB_APP_URL']?.trim() || 'http://localhost:3000';
    const apiBase = process.env['API_PUBLIC_URL']?.trim() || 'http://localhost:3333/api';
    const amount = (pkg.amountMinor / 100).toFixed(2);
    const orderDate = Math.floor(Date.now() / 1000);

    const checkoutUrl = await createWayForPayCheckout(
      {
        merchantAccount,
        merchantDomainName,
        orderReference: payment.id,
        orderDate,
        amount,
        currency: pkg.currency,
        productName: [pkg.label],
        productCount: [1],
        productPrice: [amount],
        returnUrl: `${webBase}/payment?status=success`,
        serviceUrl: `${apiBase}/billing/wayforpay/callback`,
        language: 'UA',
        merchantTransactionType: 'AUTO',
      },
      secretKey,
    );

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: `wayforpay-${payment.id}` },
    });

    return { checkoutUrl };
  }

  async handleCallback(payload: WayForPayCallbackPayload) {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const secretKey = getWayForPayRuntimeConfig(settings.config, settings.secrets).secretKey;
    if (!secretKey) {
      throw new BadRequestException('WayForPay is not configured');
    }
    if (!verifyWayForPayCallback(payload, secretKey)) {
      throw new BadRequestException('Invalid WayForPay signature');
    }

    const paymentId = String(payload.orderReference ?? '').trim();
    if (!paymentId) {
      throw new BadRequestException('Missing WayForPay order reference');
    }

    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    const status = String(payload.transactionStatus ?? '').trim();
    if (status === 'Approved' && payment.status !== 'SUCCEEDED') {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCEEDED',
          metadata: payload as object,
        },
      });

      await this.lessonBalance.grantPurchaseLessons({
        userId: payment.userId,
        lessons: payment.lessonsGranted,
        paymentId: payment.id,
      });
    } else if (
      payment.status === 'PENDING' &&
      ['Declined', 'Expired', 'Refunded', 'Voided', 'Failed'].includes(status)
    ) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          metadata: payload as object,
        },
      });
    }

    return buildWayForPayAck(paymentId, secretKey, Math.floor(Date.now() / 1000));
  }
}
