import { BadRequestException, Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { PlatformSubscriptionService, PURCHASABLE_PLANS } from '@be/billing/entitlements';
import { AuthGuard } from '../guards/auth.guard';

/**
 * School-initiated platform subscription checkout (Phase 5, Layer-B). Admin-only,
 * school-scoped. Lives in `@be/auth` (which depends on billing) and imports the
 * billing leaf barrel to avoid the auth↔billing module cycle.
 */
@Controller('billing/subscription')
@UseGuards(AuthGuard)
export class SubscriptionController {
  constructor(
    private readonly subscriptions: PlatformSubscriptionService,
    private readonly tenant: TenantContextService,
  ) {}

  @Post('portal')
  @HttpCode(HttpStatus.OK)
  portal(): Promise<{ url: string }> {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can manage the subscription');
    }
    return this.subscriptions.createPortalSession(this.tenant.requireSchoolId());
  }

  @Post('promo/redeem')
  @HttpCode(HttpStatus.OK)
  async redeemPromo(@Body() body: { code?: string }): Promise<{ trialEndsAt: string }> {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can redeem promo codes');
    }
    const code = body?.code?.trim().toUpperCase();
    if (!code) throw new UnprocessableEntityException('code is required');
    return this.subscriptions.redeemTrialExtension(this.tenant.requireSchoolId(), code);
  }

  @Post('checkout')
  checkout(@Body() body: { plan?: string; promoCode?: string }): Promise<{ url: string }> {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can manage the subscription');
    }
    const plan = body?.plan?.toUpperCase();
    if (!plan || !PURCHASABLE_PLANS.includes(plan as (typeof PURCHASABLE_PLANS)[number])) {
      throw new BadRequestException(`plan must be one of: ${PURCHASABLE_PLANS.join(', ')}`);
    }
    return this.subscriptions.createCheckout(
      this.tenant.requireSchoolId(),
      plan as (typeof PURCHASABLE_PLANS)[number],
      body?.promoCode ?? null,
    );
  }
}
