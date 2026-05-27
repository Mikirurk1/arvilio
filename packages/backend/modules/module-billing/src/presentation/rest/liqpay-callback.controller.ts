import { Body, Controller, Post } from '@nestjs/common';
import { LiqPayCheckoutService } from '../../application/liqpay-checkout.service';

@Controller('billing/liqpay')
export class LiqPayCallbackController {
  constructor(private readonly liqpayCheckout: LiqPayCheckoutService) {}

  @Post('callback')
  async callback(@Body() body: { data?: string; signature?: string }) {
    await this.liqpayCheckout.handleCallback(body.data ?? '', body.signature);
    return { ok: true };
  }
}
