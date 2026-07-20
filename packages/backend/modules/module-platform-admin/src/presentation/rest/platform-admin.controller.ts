import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { SchoolMembershipRole, SchoolMembershipStatus, SchoolStatus, UserAccountStatus } from '@prisma/client';
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
import { PlatformLlmService } from '../../application/platform-llm.service';
import { PlatformSmtpService } from '../../application/platform-smtp.service';
import {
  PromoCodesService,
  type PromoCodeDto,
  type CreatePromoCodeInput,
} from '../../application/promo-codes.service';
import type {
  UpdatePlatformIntegrationSettingsRequestDto,
  TestLlmConnectionRequestDto,
  VerifySmtpConnectionRequestDto,
  TestSmtpEmailRequestDto,
} from '@pkg/types';
import {
  PlatformUsersService,
  type PlatformSchoolMemberRowDto,
  type PlatformUserRowDto,
  type PlatformUserStatsDto,
} from '../../application/platform-users.service';
import {
  PlatformBillingRailsService,
  type PlatformBillingRailsDto,
} from '@be/billing';
import type { PlatformPageDto } from '../../application/platform-page.util';

/**
 * Platform console REST surface (Phase 4B). Every route requires an authenticated
 * platform operator: `AuthGuard` authenticates + seeds `platformRole` into CLS,
 * then `PlatformAdminGuard` enforces it. Reads are cross-tenant via `asPlatform()`.
 *
 * Nested billing routes live on {@link PlatformBillingController} (`/platform/billing/*`).
 */
@Controller('platform')
@UseGuards(AuthGuard, PlatformAdminGuard)
export class PlatformAdminController {
  constructor(
    private readonly schools: PlatformSchoolsService,
    private readonly users: PlatformUsersService,
    private readonly audit: PlatformAuditService,
    private readonly impersonation: PlatformImpersonationService,
    private readonly paymentMethods: PlatformPaymentMethodsService,
    private readonly platformLlm: PlatformLlmService,
    private readonly platformSmtp: PlatformSmtpService,
    private readonly promoCodes: PromoCodesService,
    private readonly billingRails: PlatformBillingRailsService,
  ) {}

  @Get('dashboard')
  dashboard(): Promise<PlatformDashboardDto> {
    return this.schools.dashboard();
  }

  @Get('users/stats')
  userStats(): Promise<PlatformUserStatsDto> {
    return this.users.stats();
  }

  @Get('users')
  listUsers(
    @Query('q') q?: string,
    @Query('status') status?: UserAccountStatus | 'all',
    @Query('membershipRole') membershipRole?: SchoolMembershipRole | 'all',
    @Query('schoolId') schoolId?: string,
    @Query('scope') scope?: 'all' | 'operators' | 'members' | 'orphan',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<PlatformPageDto<PlatformUserRowDto>> {
    return this.users.listUsers({
      q,
      status,
      membershipRole,
      schoolId,
      scope,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('schools')
  listSchools(
    @Query('q') q?: string,
    @Query('status') status?: SchoolStatus | 'all',
    @Query('subscriptionStatus') subscriptionStatus?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<PlatformPageDto<PlatformSchoolRowDto>> {
    return this.schools.listSchools({
      q,
      status,
      subscriptionStatus,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('schools/:id')
  getSchool(@Param('id') id: string): Promise<PlatformSchoolDetailDto> {
    return this.schools.getSchool(id);
  }

  @Get('schools/:id/members')
  listSchoolMembers(
    @Param('id') id: string,
    @Query('q') q?: string,
    @Query('role') role?: SchoolMembershipRole | 'all',
    @Query('membershipStatus') membershipStatus?: SchoolMembershipStatus | 'all',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<PlatformPageDto<PlatformSchoolMemberRowDto>> {
    return this.users.listSchoolMembers(id, {
      q,
      role,
      membershipStatus,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Patch('schools/:id')
  @PlatformAdmin('PLATFORM_ADMIN')
  patchSchool(
    @Param('id') id: string,
    @Body() body: { billingCountry?: string | null } | undefined,
    @Req() req: Request,
  ): Promise<PlatformSchoolDetailDto> {
    if (!body || !('billingCountry' in body)) {
      return this.schools.getSchool(id);
    }
    return this.schools.setBillingCountry(id, body.billingCountry, req.ip ?? null);
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
  auditLog(
    @Query('schoolId') schoolId?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<PlatformPageDto<PlatformAuditEntryDto>> {
    return this.audit.list({
      targetSchoolId: schoolId,
      q,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
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

  // --- Default Arvi LLM (Control Plane) ---

  @Get('llm')
  getLlm() {
    return this.platformLlm.get();
  }

  @Put('llm')
  @PlatformAdmin('PLATFORM_ADMIN')
  setLlm(
    @Body() body: UpdatePlatformIntegrationSettingsRequestDto | undefined,
    @Req() req: Request,
  ) {
    return this.platformLlm.set(body ?? {}, req.ip ?? null);
  }

  @Post('llm/test')
  @PlatformAdmin('PLATFORM_ADMIN')
  testLlm(
    @Body() body: TestLlmConnectionRequestDto | undefined,
    @Req() req: Request,
  ) {
    return this.platformLlm.test(body, req.ip ?? null);
  }

  // --- Transactional email SMTP (Control Plane) ---

  @Get('smtp')
  getSmtp() {
    return this.platformSmtp.get();
  }

  @Put('smtp')
  @PlatformAdmin('PLATFORM_ADMIN')
  setSmtp(
    @Body() body: UpdatePlatformIntegrationSettingsRequestDto | undefined,
    @Req() req: Request,
  ) {
    return this.platformSmtp.set(body ?? {}, req.ip ?? null);
  }

  @Post('smtp/verify')
  @PlatformAdmin('PLATFORM_ADMIN')
  verifySmtp(
    @Body() body: VerifySmtpConnectionRequestDto,
    @Req() req: Request,
  ) {
    return this.platformSmtp.verify(body, req.ip ?? null);
  }

  @Post('smtp/test')
  @PlatformAdmin('PLATFORM_ADMIN')
  testSmtp(
    @Body() body: TestSmtpEmailRequestDto,
    @Req() req: Request,
  ) {
    return this.platformSmtp.test(body, req.ip ?? null);
  }

  /** Legacy alias — prefer GET /platform/billing/rails */
  @Get('billing-rails')
  getBillingRails(): Promise<PlatformBillingRailsDto> {
    return this.billingRails.getRails();
  }

  @Put('billing-rails')
  @PlatformAdmin('PLATFORM_ADMIN')
  async setBillingRails(
    @Body()
    body:
      | {
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
        rails: dto.rails.map((r) => ({ id: r.id, enabled: r.enabled })),
      },
      ip: req.ip ?? null,
    });
    return dto;
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
