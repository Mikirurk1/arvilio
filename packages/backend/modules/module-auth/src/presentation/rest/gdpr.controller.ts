import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GdprService } from '../../application/gdpr.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';
import { TenantContextService } from '@be/tenant';

/** G15 — GDPR endpoints (data export + erasure). */
@Controller('gdpr')
@UseGuards(AuthGuard)
export class GdprController {
  constructor(
    private readonly gdpr: GdprService,
    private readonly tenant: TenantContextService,
  ) {}

  /**
   * GET /api/gdpr/export
   * Returns all personal data for the authenticated user (DSAR).
   */
  @Get('export')
  async export(@CurrentUser() userId: string) {
    return this.gdpr.exportUserData(userId);
  }

  /**
   * DELETE /api/gdpr/me
   * Anonymizes the authenticated user's personal data (right to erasure).
   * The account is deactivated; financial records are retained.
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async eraseMe(@CurrentUser() userId: string) {
    return this.gdpr.eraseUser(userId, userId);
  }
}

/**
 * Platform-admin GDPR endpoints.
 *
 * Authorization: `AuthGuard` authenticates + seeds CLS; then each handler
 * calls `requirePlatformAdmin()` to assert `platformRole` is set (avoids
 * importing `@be/platform-admin` which already imports `@be/auth` → cycle).
 */
@Controller('platform/gdpr')
@UseGuards(AuthGuard)
export class PlatformGdprController {
  constructor(
    private readonly gdpr: GdprService,
    private readonly tenant: TenantContextService,
  ) {}

  private requirePlatformAdmin(): void {
    const role = this.tenant.platformRole;
    if (!role) {
      throw new ForbiddenException('Platform operator access required');
    }
  }

  /**
   * GET /api/platform/gdpr/export/:userId
   * Platform admin exports data on behalf of a user (DPA / support request).
   */
  @Get('export/:userId')
  async exportForUser(
    @Param('userId') userId: string,
    @CurrentUser() actor: string,
  ) {
    this.requirePlatformAdmin();
    void actor;
    return this.gdpr.exportUserData(userId);
  }

  /**
   * DELETE /api/platform/gdpr/erase/:userId
   * Platform admin force-erases a user (regulatory request, abuse).
   */
  @Delete('erase/:userId')
  @HttpCode(HttpStatus.OK)
  async eraseForUser(
    @Param('userId') userId: string,
    @CurrentUser() actor: string,
  ) {
    this.requirePlatformAdmin();
    return this.gdpr.eraseUser(userId, actor);
  }
}
