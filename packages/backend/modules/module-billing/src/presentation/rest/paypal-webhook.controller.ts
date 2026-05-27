import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PayPalCheckoutService } from '../../application/paypal-checkout.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('billing/paypal')
export class PayPalWebhookController {
  constructor(private readonly payPalCheckout: PayPalCheckoutService) {}

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('paypal-auth-algo') authAlgo: string | undefined,
    @Headers('paypal-cert-url') certUrl: string | undefined,
    @Headers('paypal-transmission-id') transmissionId: string | undefined,
    @Headers('paypal-transmission-sig') transmissionSig: string | undefined,
    @Headers('paypal-transmission-time') transmissionTime: string | undefined,
  ) {
    const raw = (req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}))).toString('utf8');
    await this.payPalCheckout.handleWebhook(raw, {
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
    });
    return { received: true };
  }
}
