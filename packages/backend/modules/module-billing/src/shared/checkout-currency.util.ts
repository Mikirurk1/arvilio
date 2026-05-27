import { BadRequestException } from '@nestjs/common';
import {
  getLemonSqueezyActiveVariantCurrency,
  getPaymentProviderDisplayName,
  providerSupportsCheckoutCurrency,
  type PaymentConfigDto,
  type PaymentMethodKindDto,
} from '@pkg/types';

export function assertProviderSupportsPackageCurrency(
  method: PaymentMethodKindDto,
  config: PaymentConfigDto,
  packageCurrency: string,
): void {
  const lemonVariantCurrency = getLemonSqueezyActiveVariantCurrency(config.lemonsqueezy);
  if (
    !providerSupportsCheckoutCurrency(method, packageCurrency, {
      lemonSqueezyVariantCurrency: lemonVariantCurrency,
    })
  ) {
    throw new BadRequestException(
      `${getPaymentProviderDisplayName(method)} does not support checkout in ${packageCurrency}.`,
    );
  }
}
