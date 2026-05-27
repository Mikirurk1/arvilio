import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { StripeCheckoutService } from '../../application/stripe-checkout.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('billing/stripe')
export class StripeWebhookController {
  constructor(private readonly stripeCheckout: StripeCheckoutService) {}

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    await this.stripeCheckout.handleWebhook(raw, signature);
    return { received: true };
  }
}
