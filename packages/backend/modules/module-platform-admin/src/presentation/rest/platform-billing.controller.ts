import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@be/auth';
import {
  PlatformBillingRailsService,
  type PlatformBillingRailsDto,
  type CampusSubscriptionProductDto,
  type PlatformRailTestResult,
} from '@be/billing';
import { PlatformAdmin, PlatformAdminGuard } from '../guards/platform-admin.guard';
import { PlatformAuditService } from '../../application/platform-audit.service';

/**
 * Layer-B billing REST under `/api/platform/billing/*` (ADR-010).
 */
@Controller('platform/billing')
@UseGuards(AuthGuard, PlatformAdminGuard)
export class PlatformBillingController {
  constructor(
    private readonly billingRails: PlatformBillingRailsService,
    private readonly audit: PlatformAuditService,
  ) {}

  @Get('rails')
  getRails(): Promise<PlatformBillingRailsDto> {
    return this.billingRails.getRails();
  }

  @Put('rails')
  @PlatformAdmin('PLATFORM_ADMIN')
  async setRails(
    @Body()
    body:
      | {
          defaultRailId?: string;
          rails?: Array<{
            id: string;
            enabled?: boolean;
            config?: Record<string, string>;
            secrets?: Record<string, string>;
          }>;
        }
      | undefined,
    @Req() req: Request,
  ): Promise<PlatformBillingRailsDto> {
    const dto = await this.billingRails.setRails(body ?? {});
    await this.audit.record({
      action: 'platform.billing_rails.update',
      metadata: {
        defaultRailId: dto.defaultRailId,
        rails: dto.rails.map((r) => ({ id: r.id, enabled: r.enabled, configured: r.configured })),
      },
      ip: req.ip ?? null,
    });
    return dto;
  }

  @Post('rails/:id/test')
  @PlatformAdmin('PLATFORM_ADMIN')
  testRail(@Param('id') id: string): Promise<PlatformRailTestResult> {
    return this.billingRails.testRail(id);
  }

  @Get('campus-subscription')
  getCampusSubscription(): Promise<CampusSubscriptionProductDto> {
    return this.billingRails.getCampusSubscription();
  }

  @Put('campus-subscription')
  @PlatformAdmin('PLATFORM_ADMIN')
  async setCampusSubscription(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<CampusSubscriptionProductDto> {
    const dto = await this.billingRails.setCampusSubscription(body);
    await this.audit.record({
      action: 'platform.campus_subscription.update',
      metadata: {
        defaultRail: dto.default.railId,
        overrideCountries: dto.countryOverrides.map((o) => o.country),
      },
      ip: req.ip ?? null,
    });
    return dto;
  }
}
