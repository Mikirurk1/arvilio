import { BadRequestException, Injectable } from '@nestjs/common';
import type Stripe from 'stripe';
import type { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import {
  getPlatformStripeClient,
  getPlatformStripeWebhookSecret,
} from '../infrastructure/stripe.client';
import {
  priceIdForPlan,
  planForPriceId,
  mapStripeSubscriptionStatus,
  schoolStatusForSubscription,
} from '../shared/platform-subscription.util';
import type { PlanKey } from '../shared/subscription-plans';
import { PlatformBillingRailsService } from './platform-billing-rails.service';
import { planPriceFromOffer } from '../shared/platform-billing-products';

// Loose shapes for webhook payloads — avoids coupling to evolving Stripe types
// and keeps `applySubscriptionEvent` unit-testable with plain objects.
type Ref = string | { id?: string } | null | undefined;
type SessionLike = {
  mode?: string;
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
  subscription?: Ref;
  customer?: Ref;
};
type SubscriptionLike = {
  id: string;
  status: string;
  metadata?: Record<string, string> | null;
  customer?: Ref;
  items?: { data?: Array<{ price?: { id?: string } }> };
};
type InvoiceLike = { subscription?: Ref; customer?: Ref };

function refId(ref: Ref): string | undefined {
  if (!ref) return undefined;
  return typeof ref === 'string' ? ref : ref.id;
}

interface SubscriptionUpdate {
  status: SubscriptionStatus;
  plan?: PlanKey;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

/**
 * Platform (Layer-B) subscription billing: school → platform, on the platform's
 * Stripe account (ADR-008). Checkout creates a Stripe subscription; webhooks drive
 * the `SchoolSubscription` + `School.status` state machine (trial→paid, dunning on
 * payment failure, suspend on cancel). Platform-global → base PrismaService.
 */
@Injectable()
export class PlatformSubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingRails: PlatformBillingRailsService,
  ) {}

  private async stripe(): Promise<Stripe> {
    const cfg = await this.billingRails.resolvePlatformStripe();
    if (!cfg.enabled) {
      throw new BadRequestException('Platform Stripe billing is disabled');
    }
    const client = getPlatformStripeClient(cfg.secretKey);
    if (!client) throw new BadRequestException('Platform billing is not configured');
    return client;
  }

  async createCheckout(
    schoolId: string,
    plan: PlanKey,
    promoCode?: string | null,
  ): Promise<{ url: string }> {
    const offer = await this.billingRails.resolveCampusSubscriptionOffer(schoolId);
    if (offer.railId !== 'stripe_platform') {
      throw new BadRequestException(
        `Campus subscription checkout via "${offer.railId}" is not available yet — use Stripe or contact support`,
      );
    }

    const cfg = await this.billingRails.resolvePlatformStripe();
    if (!cfg.enabled) {
      throw new BadRequestException('Platform Stripe billing is disabled');
    }

    const planPrice = planPriceFromOffer(offer, plan);
    const stripePriceId =
      planPrice?.stripePriceId?.trim() ||
      (plan === 'STARTER' ? cfg.priceStarter : plan === 'PRO' ? cfg.pricePro : null) ||
      priceIdForPlan(plan, { starter: cfg.priceStarter, pro: cfg.pricePro });
    const amountMinor = planPrice?.amountMinor ?? null;
    const currency = offer.currency.toLowerCase();

    if (!stripePriceId && !(amountMinor && currency)) {
      throw new BadRequestException(`Plan "${plan}" is not available for purchase`);
    }

    const stripe = await this.stripe();

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true, subscription: { select: { stripeCustomerId: true } } },
    });
    if (!school) throw new BadRequestException('School not found');

    let customerId = school.subscription?.stripeCustomerId ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({ name: school.name, metadata: { schoolId } });
      customerId = customer.id;
      await this.prisma.schoolSubscription.upsert({
        where: { schoolId },
        create: { schoolId, status: 'TRIALING', stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    // Resolve + apply promo code discount if provided
    let stripeCouponId: string | undefined;
    if (promoCode) {
      stripeCouponId = await this.resolvePromoDiscount(stripe, promoCode, schoolId);
    }

    const base =
      process.env['PLATFORM_APP_URL']?.trim() ||
      process.env['WEB_APP_URL']?.trim() ||
      'http://localhost:4200';

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = stripePriceId
      ? { price: stripePriceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountMinor!,
            recurring: { interval: 'month' },
            product_data: { name: `Arvilio Campus ${plan}` },
          },
        };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [lineItem],
      client_reference_id: schoolId,
      subscription_data: {
        metadata: {
          schoolId,
          plan,
          billingCountry: offer.billingCountry ?? '',
          offerSource: offer.source,
        },
      },
      metadata: { schoolId, plan },
      success_url: `${base}/settings?billing=success`,
      cancel_url: `${base}/settings?billing=cancelled`,
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
    });
    if (!session.url) throw new BadRequestException('Could not create checkout session');
    return { url: session.url };
  }

  /**
   * Opens the Stripe Customer Portal for an existing subscriber so they can
   * upgrade/downgrade plans, update their payment method, or cancel — Stripe handles
   * all proration UI. Throws if the school has no Stripe customer yet.
   */
  async createPortalSession(schoolId: string): Promise<{ url: string }> {
    const sub = await this.prisma.schoolSubscription.findUnique({
      where: { schoolId },
      select: { stripeCustomerId: true },
    });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('No active subscription found — use checkout to subscribe first');
    }
    const stripe = await this.stripe();
    const base =
      process.env['PLATFORM_APP_URL']?.trim() ||
      process.env['WEB_APP_URL']?.trim() ||
      'http://localhost:4200';
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${base}/billing`,
    });
    return { url: session.url };
  }

  /**
   * Validate a PERCENT_OFF or FIXED_OFF promo code, record its redemption, and return
   * a Stripe coupon ID (created on-the-fly, duration=once). Throws BadRequestException
   * for invalid / exhausted / expired codes; also throws for TRIAL_EXTENSION codes
   * since those apply at signup, not at checkout.
   */
  private async resolvePromoDiscount(
    stripe: Stripe,
    code: string,
    schoolId: string,
  ): Promise<string> {
    const normalised = code.trim().toUpperCase();
    const now = new Date();

    const promo = await this.prisma.promoCode.findUnique({ where: { code: normalised } });
    if (!promo || !promo.active) throw new BadRequestException('Promo code not found or inactive');
    if (promo.kind === 'TRIAL_EXTENSION') {
      throw new BadRequestException('That code extends a trial — apply it at signup, not at checkout');
    }
    if (promo.validFrom && promo.validFrom > now) {
      throw new BadRequestException('Promo code is not yet valid');
    }
    if (promo.validTo && promo.validTo < now) {
      throw new BadRequestException('Promo code has expired');
    }
    if (promo.maxRedemptions != null && promo.redeemedCount >= promo.maxRedemptions) {
      throw new BadRequestException('Promo code has reached its redemption limit');
    }

    // Record redemption (one per school per code; duplicate → already applied)
    try {
      await this.prisma.$transaction([
        this.prisma.promoRedemption.create({ data: { promoCodeId: promo.id, schoolId } }),
        this.prisma.promoCode.update({
          where: { id: promo.id },
          data: { redeemedCount: { increment: 1 } },
        }),
      ]);
    } catch {
      throw new BadRequestException('This promo code has already been applied to your school');
    }

    // Create a single-use Stripe coupon for this checkout
    const coupon = await (promo.kind === 'PERCENT_OFF'
      ? stripe.coupons.create({ percent_off: promo.discountPercent!, duration: 'once' })
      : stripe.coupons.create({
          amount_off: promo.discountFixed!,
          currency: promo.discountCurrency ?? 'usd',
          duration: 'once',
        }));
    return coupon.id;
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
    const cfg = await this.billingRails.resolvePlatformStripe();
    const stripe = getPlatformStripeClient(cfg.secretKey);
    if (!stripe) throw new BadRequestException('Platform billing is not configured');
    const secret = getPlatformStripeWebhookSecret(cfg.webhookSecret);
    if (!secret) throw new BadRequestException('Platform webhook secret is not configured');
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature ?? '', secret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
    await this.applySubscriptionEvent(event);
  }

  /** Webhook → DB state machine (the testable core). */
  async applySubscriptionEvent(event: Stripe.Event): Promise<void> {
    const cfg = await this.billingRails.resolvePlatformStripe();
    const prices = { starter: cfg.priceStarter, pro: cfg.pricePro };
    const obj = event.data.object as unknown;
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = obj as SessionLike;
        if (s.mode !== 'subscription') return;
        const schoolId = s.metadata?.schoolId ?? s.client_reference_id ?? undefined;
        if (!schoolId) return;
        await this.updateSubscription(schoolId, {
          status: 'ACTIVE',
          plan: (s.metadata?.plan as PlanKey | undefined) ?? undefined,
          stripeSubscriptionId: refId(s.subscription),
          stripeCustomerId: refId(s.customer),
        });
        return;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = obj as SubscriptionLike;
        const schoolId = await this.resolveSchoolId({
          schoolId: sub.metadata?.schoolId,
          subscriptionId: sub.id,
          customerId: refId(sub.customer),
        });
        if (!schoolId) return;
        const plan = planForPriceId(sub.items?.data?.[0]?.price?.id, prices);
        await this.updateSubscription(schoolId, {
          status: mapStripeSubscriptionStatus(sub.status),
          plan: plan ?? undefined,
          stripeSubscriptionId: sub.id,
        });
        return;
      }
      case 'customer.subscription.deleted': {
        const sub = obj as SubscriptionLike;
        const schoolId = await this.resolveSchoolId({
          schoolId: sub.metadata?.schoolId,
          subscriptionId: sub.id,
          customerId: refId(sub.customer),
        });
        if (!schoolId) return;
        await this.updateSubscription(schoolId, { status: 'CANCELED' });
        return;
      }
      case 'invoice.payment_failed': {
        const inv = obj as InvoiceLike;
        const schoolId = await this.resolveSchoolId({
          subscriptionId: refId(inv.subscription),
          customerId: refId(inv.customer),
        });
        if (!schoolId) return;
        await this.updateSubscription(schoolId, { status: 'PAST_DUE' });
        return;
      }
      default:
        return;
    }
  }

  private async resolveSchoolId(keys: {
    schoolId?: string;
    subscriptionId?: string;
    customerId?: string;
  }): Promise<string | null> {
    if (keys.schoolId) return keys.schoolId;
    const where = keys.subscriptionId
      ? { stripeSubscriptionId: keys.subscriptionId }
      : keys.customerId
        ? { stripeCustomerId: keys.customerId }
        : null;
    if (!where) return null;
    const row = await this.prisma.schoolSubscription.findFirst({ where, select: { schoolId: true } });
    return row?.schoolId ?? null;
  }

  private async updateSubscription(schoolId: string, data: SubscriptionUpdate): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.schoolSubscription.upsert({
        where: { schoolId },
        create: {
          schoolId,
          status: data.status,
          plan: data.plan,
          stripeSubscriptionId: data.stripeSubscriptionId,
          stripeCustomerId: data.stripeCustomerId,
        },
        update: {
          status: data.status,
          ...(data.plan ? { plan: data.plan } : {}),
          ...(data.stripeSubscriptionId ? { stripeSubscriptionId: data.stripeSubscriptionId } : {}),
          ...(data.stripeCustomerId ? { stripeCustomerId: data.stripeCustomerId } : {}),
        },
      });
      await tx.school.update({
        where: { id: schoolId },
        data: { status: schoolStatusForSubscription(data.status) },
      });
    });
  }

  /**
   * Redeem a TRIAL_EXTENSION promo code for a school that is currently on TRIAL.
   * Extends `SchoolSubscription.trialEndsAt` by `promo.trialDays` from whichever
   * is later: now or the existing `trialEndsAt`. Returns the new `trialEndsAt`.
   * A school may redeem the same code only once (@@unique constraint).
   */
  async redeemTrialExtension(
    schoolId: string,
    code: string,
  ): Promise<{ trialEndsAt: string }> {
    const normalised = code.trim().toUpperCase();
    const now = new Date();

    const [school, promo] = await Promise.all([
      this.prisma.school.findUnique({
        where: { id: schoolId },
        select: { status: true, subscription: { select: { trialEndsAt: true } } },
      }),
      this.prisma.promoCode.findUnique({ where: { code: normalised } }),
    ]);

    if (!school) throw new BadRequestException('School not found');
    if (school.status !== 'TRIAL') {
      throw new BadRequestException('Trial extension codes can only be applied to schools on a free trial');
    }
    if (!promo || !promo.active) throw new BadRequestException('Promo code not found or inactive');
    if (promo.kind !== 'TRIAL_EXTENSION') {
      throw new BadRequestException('This code is not a trial extension — apply it at checkout');
    }
    if (promo.validFrom && promo.validFrom > now) {
      throw new BadRequestException('Promo code is not yet valid');
    }
    if (promo.validTo && promo.validTo < now) {
      throw new BadRequestException('Promo code has expired');
    }

    const base = school.subscription?.trialEndsAt ?? now;
    const extendFrom = base > now ? base : now;
    const trialEndsAt = new Date(extendFrom.getTime() + (promo.trialDays ?? 0) * 24 * 60 * 60 * 1000);

    try {
      await this.prisma.$transaction(async (tx) => {
        // Atomic claim — prevents over-redemption when maxRedemptions is set
        if (promo.maxRedemptions != null) {
          const claimed = await tx.promoCode.updateMany({
            where: { id: promo.id, redeemedCount: { lt: promo.maxRedemptions } },
            data: { redeemedCount: { increment: 1 } },
          });
          if (claimed.count !== 1) throw new BadRequestException('Promo code has reached its redemption limit');
        } else {
          await tx.promoCode.update({ where: { id: promo.id }, data: { redeemedCount: { increment: 1 } } });
        }
        await tx.promoRedemption.create({ data: { promoCodeId: promo.id, schoolId } });
        await tx.schoolSubscription.upsert({
          where: { schoolId },
          create: { schoolId, trialEndsAt },
          update: { trialEndsAt },
        });
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      // @@unique([promoCodeId, schoolId]) violation = already redeemed
      throw new BadRequestException('This promo code has already been applied to your school');
    }

    return { trialEndsAt: trialEndsAt.toISOString() };
  }
}
