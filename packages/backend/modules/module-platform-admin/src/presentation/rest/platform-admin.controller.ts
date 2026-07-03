import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard, setImpersonationAccessCookie } from '@be/auth';
import { PlatformAdmin, PlatformAdminGuard } from '../guards/platform-admin.guard';
import {
  PlatformSchoolsService,
  type PlatformDashboardDto,
  type PlatformSchoolDetailDto,
  type PlatformSchoolRowDto,
} from '../../application/platform-schools.service';
import {
  PlatformAuditService,
  type PlatformAuditEntryDto,
} from '../../application/platform-audit.service';
import { PlatformImpersonationService } from '../../application/platform-impersonation.service';
import {
  PlatformPaymentMethodsService,
  type PaymentAllowlistDto,
} from '../../application/platform-payment-methods.service';
import {
  PromoCodesService,
  type PromoCodeDto,
  type CreatePromoCodeInput,
} from '../../application/promo-codes.service';

/**
 * Platform console REST surface (Phase 4B). Every route requires an authenticated
 * platform operator: `AuthGuard` authenticates + seeds `platformRole` into CLS,
 * then `PlatformAdminGuard` enforces it. Reads are cross-tenant via `asPlatform()`.
 */
@Controller('platform')
@UseGuards(AuthGuard, PlatformAdminGuard)
export class PlatformAdminController {
  constructor(
    private readonly schools: PlatformSchoolsService,
    private readonly audit: PlatformAuditService,
    private readonly impersonation: PlatformImpersonationService,
    private readonly paymentMethods: PlatformPaymentMethodsService,
    private readonly promoCodes: PromoCodesService,
  ) {}

  @Get('dashboard')
  dashboard(): Promise<PlatformDashboardDto> {
    return this.schools.dashboard();
  }

  @Get('schools')
  listSchools(): Promise<PlatformSchoolRowDto[]> {
    return this.schools.listSchools();
  }

  @Get('schools/:id')
  getSchool(@Param('id') id: string): Promise<PlatformSchoolDetailDto> {
    return this.schools.getSchool(id);
  }

  // Mutating actions require an admin operator (not support/billing).
  @Post('schools/:id/suspend')
  @PlatformAdmin('PLATFORM_ADMIN')
  suspendSchool(@Param('id') id: string, @Req() req: Request): Promise<PlatformSchoolDetailDto> {
    return this.schools.setSchoolStatus(id, 'SUSPENDED', req.ip ?? null);
  }

  @Post('schools/:id/activate')
  @PlatformAdmin('PLATFORM_ADMIN')
  activateSchool(@Param('id') id: string, @Req() req: Request): Promise<PlatformSchoolDetailDto> {
    return this.schools.setSchoolStatus(id, 'ACTIVE', req.ip ?? null);
  }

  /**
   * Start impersonating a school user (Gate 4). Mints a short-lived impersonation
   * token (default target: the school's first active admin) and sets it as the
   * access cookie; the operator's refresh cookie is untouched, so the session
   * auto-returns to the operator at expiry or via `POST /api/auth/impersonate/stop`.
   */
  @Post('schools/:id/impersonate')
  @PlatformAdmin('PLATFORM_ADMIN')
  async impersonate(
    @Param('id') id: string,
    @Body() body: { targetUserId?: string } | undefined,
    @Req() req: Request & { user?: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ targetUserId: string; expiresInSeconds: number }> {
    const result = await this.impersonation.start({
      schoolId: id,
      actorUserId: req.user?.id ?? '',
      targetUserId: body?.targetUserId,
      ip: req.ip ?? null,
    });
    setImpersonationAccessCookie(res, result.accessToken);
    return { targetUserId: result.targetUserId, expiresInSeconds: result.expiresInSeconds };
  }

  @Get('audit-log')
  auditLog(@Query('schoolId') schoolId?: string): Promise<PlatformAuditEntryDto[]> {
    return this.audit.list({ targetSchoolId: schoolId });
  }

  // --- Payment-method allowlist (platform settings) ---

  @Get('payment-methods')
  getPaymentMethods(): Promise<PaymentAllowlistDto> {
    return this.paymentMethods.get();
  }

  @Put('payment-methods')
  @PlatformAdmin('PLATFORM_ADMIN')
  setPaymentMethods(
    @Body() body: { allowed?: string[] } | undefined,
    @Req() req: Request,
  ): Promise<PaymentAllowlistDto> {
    return this.paymentMethods.set(body?.allowed ?? [], req.ip ?? null);
  }

  // --- Promo codes (Phase 4.5.2) ---

  @Get('promo-codes')
  listPromoCodes(): Promise<PromoCodeDto[]> {
    return this.promoCodes.list();
  }

  @Post('promo-codes')
  @PlatformAdmin('PLATFORM_ADMIN')
  createPromoCode(
    @Body() body: CreatePromoCodeInput,
    @Req() req: Request,
  ): Promise<PromoCodeDto> {
    return this.promoCodes.create(body, req.ip ?? null);
  }

  @Patch('promo-codes/:id')
  @PlatformAdmin('PLATFORM_ADMIN')
  setPromoCodeActive(
    @Param('id') id: string,
    @Body() body: { active: boolean },
    @Req() req: Request,
  ): Promise<PromoCodeDto> {
    return this.promoCodes.setActive(id, body?.active ?? false, req.ip ?? null);
  }
}
