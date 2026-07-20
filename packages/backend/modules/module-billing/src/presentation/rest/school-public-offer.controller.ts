import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import type { PaymentMethodKindDto, ResolvedLessonPackageDto } from '@pkg/types';
import { PaymentSettingsService } from '../../application/payment-settings.service';
import { resolvePackagesForPrice } from '../../shared/payment-map.util';

export type PublicOfferPackageDto = Pick<
  ResolvedLessonPackageDto,
  | 'id'
  | 'lessons'
  | 'label'
  | 'description'
  | 'currency'
  | 'amountMinor'
  | 'pricePerLessonMinor'
  | 'creditTrack'
>;

export type PublicOfferDto = {
  schoolName: string;
  packages: PublicOfferPackageDto[];
  /** Online PSP methods currently enabled (excludes manual_invoice). */
  enabledOnlineMethods: PaymentMethodKindDto[];
  allowedProductsNote: string;
};

const ONLINE_METHODS: PaymentMethodKindDto[] = [
  'stripe',
  'liqpay',
  'wayforpay',
  'lemonsqueezy',
  'paddle',
  'monopay',
  'paypal',
];

/** Public catalog for merchant compliance — no auth, tenant from host. */
@Controller('school/public-offer')
export class SchoolPublicOfferController {
  constructor(
    private readonly paymentSettings: PaymentSettingsService,
    private readonly tenant: TenantContextService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async get(): Promise<PublicOfferDto> {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) {
      return {
        schoolName: '',
        packages: [],
        enabledOnlineMethods: [],
        allowedProductsNote:
          'This school sells prepaid language lesson credits only. No physical goods, gambling, or crypto products.',
      };
    }

    const [settings, school] = await Promise.all([
      this.paymentSettings.getPaymentSettings(),
      this.prisma.school.findUnique({
        where: { id: schoolId },
        select: { name: true },
      }),
    ]);

    const packages = resolvePackagesForPrice(
      settings.config,
      settings.config.defaultPricePerLessonMinor,
      false,
    )
      .filter((pkg) => pkg.amountMinor > 0)
      .map((pkg) => ({
        id: pkg.id,
        lessons: pkg.lessons,
        label: pkg.label,
        description: pkg.description,
        currency: pkg.currency,
        amountMinor: pkg.amountMinor,
        pricePerLessonMinor: pkg.pricePerLessonMinor,
        creditTrack: pkg.creditTrack,
      }));

    return {
      schoolName: school?.name ?? '',
      packages,
      enabledOnlineMethods: settings.enabledMethods.filter((m) =>
        ONLINE_METHODS.includes(m),
      ),
      allowedProductsNote:
        'This school sells prepaid language lesson credits only. No physical goods, gambling, or crypto products.',
    };
  }
}
