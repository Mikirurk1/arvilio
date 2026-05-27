import { Body, Controller, Post } from '@nestjs/common';
import { WayForPayCheckoutService } from '../../application/wayforpay-checkout.service';

@Controller('billing/wayforpay')
export class WayForPayCallbackController {
  constructor(private readonly wayforpayCheckout: WayForPayCheckoutService) {}

  @Post('callback')
  async callback(@Body() body: Record<string, unknown>) {
    return this.wayforpayCheckout.handleCallback(body);
  }
}
