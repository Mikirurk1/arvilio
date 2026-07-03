import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethodKind } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { PlatformAuditService } from './platform-audit.service';

const SETTINGS_ID = 'default';

export interface PaymentAllowlistDto {
  /** Methods schools are permitted to enable. Empty = no restriction. */
  allowed: PaymentMethodKind[];
  /** All known payment methods (for rendering the editor). */
  allMethods: PaymentMethodKind[];
}

/**
 * Platform-wide payment-method allowlist (Phase 4D / ADR-009). Platform-global
 * config on the `PlatformSettings` singleton, so it uses the base PrismaService
 * (not the tenant-scoped client). Schools may only enable methods in this set
 * (enforced in `@be/billing` `PaymentSettingsService`).
 */
@Injectable()
export class PlatformPaymentMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: PlatformAuditService,
  ) {}

  private allMethods(): PaymentMethodKind[] {
    return Object.values(PaymentMethodKind);
  }

  async get(): Promise<PaymentAllowlistDto> {
    const row = await this.prisma.platformSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { allowedPaymentMethods: true },
    });
    return { allowed: row?.allowedPaymentMethods ?? [], allMethods: this.allMethods() };
  }

  async set(methods: string[], ip?: string | null): Promise<PaymentAllowlistDto> {
    const valid = new Set<string>(this.allMethods());
    const deduped = Array.from(new Set(methods));
    const unknown = deduped.filter((m) => !valid.has(m));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown payment method(s): ${unknown.join(', ')}`);
    }
    const next = deduped as PaymentMethodKind[];
    const prev = await this.get();
    await this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, allowedPaymentMethods: next },
      update: { allowedPaymentMethods: next },
    });
    await this.audit.record({
      action: 'platform.payment_methods.update',
      metadata: { from: prev.allowed, to: next },
      ip: ip ?? null,
    });
    return this.get();
  }
}
