import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type PromoCode } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { PlatformAuditService } from './platform-audit.service';

export interface PromoCodeDto {
  id: string;
  code: string;
  kind: string;
  trialDays: number | null;
  discountPercent: number | null;
  discountFixed: number | null;
  discountCurrency: string | null;
  maxRedemptions: number | null;
  redeemedCount: number;
  validFrom: string | null;
  validTo: string | null;
  active: boolean;
  createdAt: string;
}

export type CreatePromoCodeInput =
  | {
      kind: 'TRIAL_EXTENSION';
      code: string;
      trialDays: number;
      maxRedemptions?: number | null;
      validFrom?: string | null;
      validTo?: string | null;
    }
  | {
      kind: 'PERCENT_OFF';
      code: string;
      discountPercent: number;
      maxRedemptions?: number | null;
      validFrom?: string | null;
      validTo?: string | null;
    }
  | {
      kind: 'FIXED_OFF';
      code: string;
      discountFixed: number;
      discountCurrency: string;
      maxRedemptions?: number | null;
      validFrom?: string | null;
      validTo?: string | null;
    };

function toDto(p: PromoCode): PromoCodeDto {
  return {
    id: p.id,
    code: p.code,
    kind: p.kind,
    trialDays: p.trialDays,
    discountPercent: p.discountPercent,
    discountFixed: p.discountFixed,
    discountCurrency: p.discountCurrency,
    maxRedemptions: p.maxRedemptions,
    redeemedCount: p.redeemedCount,
    validFrom: p.validFrom?.toISOString() ?? null,
    validTo: p.validTo?.toISOString() ?? null,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
  };
}

function validateInput(input: CreatePromoCodeInput): void {
  const code = input.code?.trim();
  if (!code) throw new BadRequestException('code is required');

  if (input.kind === 'TRIAL_EXTENSION') {
    if (!Number.isInteger(input.trialDays) || input.trialDays < 1) {
      throw new BadRequestException('trialDays must be a positive integer for TRIAL_EXTENSION');
    }
  } else if (input.kind === 'PERCENT_OFF') {
    if (!Number.isInteger(input.discountPercent) || input.discountPercent < 1 || input.discountPercent > 100) {
      throw new BadRequestException('discountPercent must be an integer between 1 and 100');
    }
  } else if (input.kind === 'FIXED_OFF') {
    if (!Number.isInteger(input.discountFixed) || input.discountFixed < 1) {
      throw new BadRequestException('discountFixed must be a positive integer (cents)');
    }
    if (!input.discountCurrency?.trim()) {
      throw new BadRequestException('discountCurrency is required for FIXED_OFF');
    }
  }

  const maxR = (input as { maxRedemptions?: number | null }).maxRedemptions;
  if (maxR != null && (!Number.isInteger(maxR) || maxR < 1)) {
    throw new BadRequestException('maxRedemptions must be a positive integer when set');
  }
}

/**
 * Platform-operator promo-code management (Phase 4.5.2 + Phase 5, G29). Platform-global
 * (base PrismaService). TRIAL_EXTENSION codes extend trial at signup; PERCENT_OFF/FIXED_OFF
 * codes apply a Stripe coupon at platform subscription checkout.
 */
@Injectable()
export class PromoCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: PlatformAuditService,
  ) {}

  async list(): Promise<PromoCodeDto[]> {
    const rows = await this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toDto);
  }

  async create(input: CreatePromoCodeInput, ip?: string | null): Promise<PromoCodeDto> {
    validateInput(input);
    const code = input.code.trim().toUpperCase();
    try {
      const created = await this.prisma.promoCode.create({
        data: {
          code,
          kind: input.kind,
          trialDays: input.kind === 'TRIAL_EXTENSION' ? input.trialDays : null,
          discountPercent: input.kind === 'PERCENT_OFF' ? input.discountPercent : null,
          discountFixed: input.kind === 'FIXED_OFF' ? input.discountFixed : null,
          discountCurrency:
            input.kind === 'FIXED_OFF' ? input.discountCurrency.trim().toLowerCase() : null,
          maxRedemptions: (input as { maxRedemptions?: number | null }).maxRedemptions ?? null,
          validFrom:
            (input as { validFrom?: string | null }).validFrom
              ? new Date((input as { validFrom: string }).validFrom)
              : null,
          validTo:
            (input as { validTo?: string | null }).validTo
              ? new Date((input as { validTo: string }).validTo)
              : null,
        },
      });
      await this.audit.record({
        action: 'platform.promo_code.create',
        metadata: { code, kind: input.kind },
        ip: ip ?? null,
      });
      return toDto(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A promo code with that code already exists');
      }
      throw error;
    }
  }

  async setActive(id: string, active: boolean, ip?: string | null): Promise<PromoCodeDto> {
    const existing = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promo code not found');
    const updated = await this.prisma.promoCode.update({ where: { id }, data: { active } });
    await this.audit.record({
      action: 'platform.promo_code.update',
      metadata: { code: existing.code, active },
      ip: ip ?? null,
    });
    return toDto(updated);
  }
}
