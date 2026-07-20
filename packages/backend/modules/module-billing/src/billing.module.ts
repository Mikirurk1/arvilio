import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { EntitlementsService } from './application/entitlements.service';
import { StorageAccountingService } from './application/storage-accounting.service';
import { PlatformSubscriptionService } from './application/platform-subscription.service';
import { PlatformBillingRailsService } from './application/platform-billing-rails.service';
import { PlatformSubscriptionWebhookController } from './presentation/rest/platform-subscription-webhook.controller';
import { LemonSqueezyCheckoutService } from './application/lemonsqueezy-checkout.service';
import { LessonBalanceService } from './application/lesson-balance.service';
import { LiqPayCheckoutService } from './application/liqpay-checkout.service';
import { MonoPayCheckoutService } from './application/monopay-checkout.service';
import { PaddleCheckoutService } from './application/paddle-checkout.service';
import { PayPalCheckoutService } from './application/paypal-checkout.service';
import { PaymentSettingsService } from './application/payment-settings.service';
import { StripeCheckoutService } from './application/stripe-checkout.service';
import { WayForPayCheckoutService } from './application/wayforpay-checkout.service';
import { StaffPayrollResolver } from './presentation/graphql/staff-payroll.resolver';
import { BillingResolver } from './presentation/graphql/billing.resolver';
import { StaffPayrollService } from './application/staff-payroll.service';
import { LemonSqueezyWebhookController } from './presentation/rest/lemonsqueezy-webhook.controller';
import { LiqPayCallbackController } from './presentation/rest/liqpay-callback.controller';
import { MonoPayWebhookController } from './presentation/rest/monopay-webhook.controller';
import { PaddleWebhookController } from './presentation/rest/paddle-webhook.controller';
import { PayPalWebhookController } from './presentation/rest/paypal-webhook.controller';
import { StripeWebhookController } from './presentation/rest/stripe-webhook.controller';
import { WayForPayCallbackController } from './presentation/rest/wayforpay-callback.controller';
import { SchoolPublicOfferController } from './presentation/rest/school-public-offer.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    StripeWebhookController,
    LiqPayCallbackController,
    WayForPayCallbackController,
    LemonSqueezyWebhookController,
    PaddleWebhookController,
    MonoPayWebhookController,
    PayPalWebhookController,
    PlatformSubscriptionWebhookController,
    SchoolPublicOfferController,
  ],
  providers: [
    EntitlementsService,
    StorageAccountingService,
    PlatformSubscriptionService,
    PlatformBillingRailsService,
    PaymentSettingsService,
    LessonBalanceService,
    StripeCheckoutService,
    LiqPayCheckoutService,
    WayForPayCheckoutService,
    LemonSqueezyCheckoutService,
    PaddleCheckoutService,
    MonoPayCheckoutService,
    PayPalCheckoutService,
    StaffPayrollService,
    BillingResolver,
    StaffPayrollResolver,
  ],
  exports: [
    LessonBalanceService,
    PaymentSettingsService,
    StaffPayrollService,
    EntitlementsService,
    StorageAccountingService,
    PlatformSubscriptionService,
    PlatformBillingRailsService,
  ],
})
export class BillingModule {}
