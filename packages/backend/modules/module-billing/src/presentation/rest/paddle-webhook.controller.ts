import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PaddleCheckoutService } from '../../application/paddle-checkout.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('billing/paddle')
export class PaddleWebhookController {
  constructor(private readonly paddleCheckout: PaddleCheckoutService) {}

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('paddle-signature') signature: string | undefined,
  ) {
    const raw = (req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}))).toString('utf8');
    await this.paddleCheckout.handleWebhook(raw, signature);
    return { received: true };
  }
}
