import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

export interface SchoolSellerProfileDto {
  schoolName: string;
  legalName: string | null;
  legalAddress: string | null;
  legalCountry: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  mcc: string | null;
  termsOverrideMd: string | null;
  paymentRefundOverrideMd: string | null;
  /** True when required fields for online PSP checkout are present. */
  isComplete: boolean;
}

export type UpdateSchoolSellerProfileDto = Partial<
  Pick<
    SchoolSellerProfileDto,
    | 'legalName'
    | 'legalAddress'
    | 'legalCountry'
    | 'supportEmail'
    | 'supportPhone'
    | 'mcc'
    | 'termsOverrideMd'
    | 'paymentRefundOverrideMd'
  >
>;

const ISO_ALPHA2 = /^[A-Za-z]{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_MCC = '8299';

export function isSellerProfileComplete(
  profile: Pick<
    SchoolSellerProfileDto,
    'legalName' | 'legalAddress' | 'legalCountry' | 'supportEmail'
  >,
): boolean {
  return Boolean(
    profile.legalName?.trim() &&
      profile.legalAddress?.trim() &&
      (profile.legalCountry?.trim() || 'UA') &&
      profile.supportEmail?.trim(),
  );
}

/** Merchant seller profile for payment compliance (public legal + checkout gate). */
@Injectable()
export class SchoolSellerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(schoolId: string): Promise<SchoolSellerProfileDto> {
    const school = await this.prisma.school.findUniqueOrThrow({
      where: { id: schoolId },
      select: {
        name: true,
        legalName: true,
        legalAddress: true,
        legalCountry: true,
        supportEmail: true,
        supportPhone: true,
        mcc: true,
        termsOverrideMd: true,
        paymentRefundOverrideMd: true,
      },
    });
    return this.toDto(school);
  }

  async update(
    schoolId: string,
    patch: UpdateSchoolSellerProfileDto,
  ): Promise<SchoolSellerProfileDto> {
    if (patch.legalCountry !== undefined && patch.legalCountry !== null) {
      const country = patch.legalCountry.trim().toUpperCase();
      if (!ISO_ALPHA2.test(country)) {
        throw new BadRequestException('legalCountry must be an ISO 3166-1 alpha-2 code');
      }
      patch = { ...patch, legalCountry: country };
    }
    if (patch.supportEmail !== undefined && patch.supportEmail !== null) {
      const email = patch.supportEmail.trim();
      if (email && !EMAIL_RE.test(email)) {
        throw new BadRequestException('supportEmail must be a valid email address');
      }
      patch = { ...patch, supportEmail: email || null };
    }
    if (patch.mcc !== undefined && patch.mcc !== null) {
      const mcc = patch.mcc.trim();
      if (mcc && !/^\d{4}$/.test(mcc)) {
        throw new BadRequestException('mcc must be a 4-digit Merchant Category Code');
      }
      patch = { ...patch, mcc: mcc || DEFAULT_MCC };
    }

    const updated = await this.prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(patch.legalName !== undefined && {
          legalName: patch.legalName?.trim() || null,
        }),
        ...(patch.legalAddress !== undefined && {
          legalAddress: patch.legalAddress?.trim() || null,
        }),
        ...(patch.legalCountry !== undefined && { legalCountry: patch.legalCountry }),
        ...(patch.supportEmail !== undefined && { supportEmail: patch.supportEmail }),
        ...(patch.supportPhone !== undefined && {
          supportPhone: patch.supportPhone?.trim() || null,
        }),
        ...(patch.mcc !== undefined && { mcc: patch.mcc }),
        ...(patch.termsOverrideMd !== undefined && {
          termsOverrideMd: patch.termsOverrideMd?.trim() || null,
        }),
        ...(patch.paymentRefundOverrideMd !== undefined && {
          paymentRefundOverrideMd: patch.paymentRefundOverrideMd?.trim() || null,
        }),
      },
      select: {
        name: true,
        legalName: true,
        legalAddress: true,
        legalCountry: true,
        supportEmail: true,
        supportPhone: true,
        mcc: true,
        termsOverrideMd: true,
        paymentRefundOverrideMd: true,
      },
    });
    return this.toDto(updated);
  }

  private toDto(school: {
    name: string;
    legalName: string | null;
    legalAddress: string | null;
    legalCountry: string | null;
    supportEmail: string | null;
    supportPhone: string | null;
    mcc: string | null;
    termsOverrideMd: string | null;
    paymentRefundOverrideMd: string | null;
  }): SchoolSellerProfileDto {
    const dto: SchoolSellerProfileDto = {
      schoolName: school.name,
      legalName: school.legalName,
      legalAddress: school.legalAddress,
      legalCountry: school.legalCountry ?? 'UA',
      supportEmail: school.supportEmail,
      supportPhone: school.supportPhone,
      mcc: school.mcc ?? DEFAULT_MCC,
      termsOverrideMd: school.termsOverrideMd,
      paymentRefundOverrideMd: school.paymentRefundOverrideMd,
      isComplete: false,
    };
    dto.isComplete = isSellerProfileComplete(dto);
    return dto;
  }
}
