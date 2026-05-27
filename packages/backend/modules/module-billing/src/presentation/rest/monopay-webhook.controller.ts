import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MonoPayCheckoutService } from '../../application/monopay-checkout.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('billing/monopay')
export class MonoPayWebhookController {
  constructor(private readonly monoPayCheckout: MonoPayCheckoutService) {}

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('x-sign') signature: string | undefined,
  ) {
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    await this.monoPayCheckout.handleWebhook(raw, signature);
    return { received: true };
  }
}
