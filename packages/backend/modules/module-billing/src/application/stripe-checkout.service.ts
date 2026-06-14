import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { CreateLessonPurchaseCheckoutRequestDto, LessonPurchaseCheckoutDto } from '@pkg/types';
import { parseLessonCreditTrack } from '@pkg/types';
import { getStripeClient } from '../infrastructure/stripe.client';
import { LessonBalanceService } from './lesson-balance.service';
import { PaymentSettingsService } from './payment-settings.service';
import { getStripeRuntimeConfig, paymentMethodFromDto } from '../shared/payment-map.util';
import { assertProviderSupportsPackageCurrency } from '../shared/checkout-currency.util';

@Injectable()
export class StripeCheckoutService {
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
    const stripeConfig = getStripeRuntimeConfig(settings.config, settings.secrets);
    const stripe = getStripeClient(stripeConfig.secretKey);
    if (!stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
    const available = await this.paymentSettings.resolveAvailableMethodsForStudent(userId);
    if (!available.includes('stripe') || input.method !== 'stripe') {
      throw new BadRequestException('Stripe payment is not available');
    }
    const pkg = await this.paymentSettings.getPackageForCheckout(userId, input.packageId);
    if (!pkg) throw new BadRequestException('Package not found');
    assertProviderSupportsPackageCurrency('stripe', settings.config, pkg.currency);
    if (pkg.amountMinor <= 0) {
      throw new BadRequestException('Lesson price is not configured');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        method: paymentMethodFromDto('stripe'),
        status: 'PENDING',
        lessonsGranted: pkg.lessons,
        amountMinor: pkg.amountMinor,
        currency: pkg.currency,
        metadata: { creditTrack: pkg.creditTrack },
      },
    });

    const webBase = process.env['WEB_APP_URL']?.trim() || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${webBase}/payment?status=success`,
      cancel_url: `${webBase}/payment?status=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pkg.currency.toLowerCase(),
            unit_amount: pkg.amountMinor,
            product_data: { name: pkg.label },
          },
        },
      ],
      metadata: {
        paymentId: payment.id,
        userId,
        packageId: pkg.id,
        lessons: String(pkg.lessons),
      },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: session.id },
    });

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL');
    }
    return { checkoutUrl: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
    const settings = await this.paymentSettings.getRuntimePaymentSettings();
    const stripeConfig = getStripeRuntimeConfig(settings.config, settings.secrets);
    const stripe = getStripeClient(stripeConfig.secretKey);
    const secret = stripeConfig.webhookSecret;
    if (!stripe || !secret) return;

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature ?? '', secret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type !== 'checkout.session.completed') return;

    const session = event.data.object;
    const paymentId = session.metadata?.['paymentId'];
    if (!paymentId) return;

    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status === 'SUCCEEDED') return;

    const paymentMeta =
      payment.metadata && typeof payment.metadata === 'object'
        ? (payment.metadata as Record<string, unknown>)
        : null;
    const creditTrack = parseLessonCreditTrack(paymentMeta?.['creditTrack']);

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCEEDED',
        externalId: session.id,
        metadata: session as object,
      },
    });

    await this.lessonBalance.grantPurchaseLessons({
      userId: payment.userId,
      lessons: payment.lessonsGranted,
      paymentId: payment.id,
      creditTrack,
    });
  }
}
