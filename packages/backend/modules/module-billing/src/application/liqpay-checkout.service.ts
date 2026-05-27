import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { CreateLessonPurchaseCheckoutRequestDto, LessonPurchaseCheckoutDto } from '@pkg/types';
import {
  buildLiqPayCheckoutUrl,
  decodeLiqPayData,
  encodeLiqPayData,
  signLiqPay,
  verifyLiqPaySignature,
} from '../infrastructure/liqpay.client';
import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';
import { getLiqPayRuntimeConfig, paymentMethodFromDto } from '../shared/payment-map.util';
import { assertProviderSupportsPackageCurrency } from '../shared/checkout-currency.util';

@Injectable()
export class LiqPayCheckoutService {
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
    const liqpayConfig = getLiqPayRuntimeConfig(settings.config, settings.secrets);
    const publicKey = liqpayConfig.publicKey;
    const privateKey = liqpayConfig.privateKey;
    if (!publicKey || !privateKey) {
      throw new BadRequestException('LiqPay is not configured');
    }
    const available = await this.paymentSettings.resolveAvailableMethodsForStudent(userId);
    if (!available.includes('liqpay') || input.method !== 'liqpay') {
      throw new BadRequestException('LiqPay payment is not available');
    }
    const pkg = await this.paymentSettings.getPackageForCheckout(userId, input.packageId);
    if (!pkg) throw new BadRequestException('Package not found');
    assertProviderSupportsPackageCurrency('liqpay', settings.config, pkg.currency);
    if (pkg.amountMinor <= 0) {
      throw new BadRequestException('Lesson price is not configured');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        method: paymentMethodFromDto('liqpay'),
        status: 'PENDING',
        lessonsGranted: pkg.lessons,
        amountMinor: pkg.amountMinor,
        currency: pkg.currency,
      },
    });
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: `liqpay-${payment.id}` },
    });

    const webBase = process.env['WEB_APP_URL']?.trim() || 'http://localhost:3000';
    const apiBase = process.env['API_PUBLIC_URL']?.trim() || 'http://localhost:3333/api';
    const sandbox = liqpayConfig.sandbox;

    const amount = pkg.amountMinor / 100;
    const payload = encodeLiqPayData({
      public_key: publicKey,
      version: '3',
      action: 'pay',
      amount,
      currency: pkg.currency,
      description: pkg.label,
      order_id: payment.id,
      result_url: `${webBase}/payment?status=success`,
      server_url: `${apiBase}/billing/liqpay/callback`,
      sandbox: sandbox ? 1 : undefined,
    });
    const signature = signLiqPay(payload, privateKey);
    const checkoutUrl = buildLiqPayCheckoutUrl({ data: payload, signature, sandbox });

    return { checkoutUrl };
  }

  async handleCallback(data: string, signature: string | undefined): Promise<void> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const privateKey = getLiqPayRuntimeConfig(settings.config, settings.secrets).privateKey;
    if (!privateKey || !data || !signature) {
      throw new BadRequestException('Invalid LiqPay callback');
    }
    if (!verifyLiqPaySignature(data, signature, privateKey)) {
      throw new BadRequestException('Invalid LiqPay signature');
    }

    const decoded = decodeLiqPayData<{
      order_id?: string;
      status?: string;
    }>(data);
    const orderId = decoded['order_id'];
    if (!orderId) return;

    const payment = await this.prisma.payment.findUnique({ where: { id: orderId } });
    if (!payment || payment.status === 'SUCCEEDED') return;

    const status = decoded['status'] ?? '';
    if (status !== 'success' && status !== 'sandbox') {
      await this.prisma.payment.update({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });
      return;
    }

    await this.prisma.payment.update({
      where: { id: orderId },
      data: { status: 'SUCCEEDED', metadata: decoded as object },
    });

    await this.lessonBalance.grantPurchaseLessons({
      userId: payment.userId,
      lessons: payment.lessonsGranted,
      paymentId: payment.id,
    });
  }
}
