import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LemonSqueezyCheckoutService } from '../../application/lemonsqueezy-checkout.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('billing/lemonsqueezy')
export class LemonSqueezyWebhookController {
  constructor(private readonly lemonsqueezyCheckout: LemonSqueezyCheckoutService) {}

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('x-signature') signature: string | undefined,
  ) {
    const raw = (req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}))).toString('utf8');
    await this.lemonsqueezyCheckout.handleWebhook(raw, signature);
    return { received: true };
  }
}
