import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PlatformSubscriptionService } from '../../application/platform-subscription.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

/**
 * Platform (Layer-B) Stripe webhook. Public + signature-verified (no AuthGuard),
 * matching the Layer-A webhook pattern. Drives the school-subscription state machine.
 */
@Controller('platform-billing/stripe')
export class PlatformSubscriptionWebhookController {
  constructor(private readonly subscriptions: PlatformSubscriptionService) {}

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    await this.subscriptions.handleWebhook(raw, signature);
    return { received: true };
  }
}
