import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { AuthGuard } from '../guards/auth.guard';
import { SchoolBrandingService, type SchoolBrandingDto } from '../../application/school-branding.service';

/** G18 — school branding: color + logo. Public GET, admin-only PATCH. */
@Controller('school/branding')
export class SchoolBrandingController {
  constructor(
    private readonly branding: SchoolBrandingService,
    private readonly tenant: TenantContextService,
  ) {}

  /** Public: Next.js layout fetches this to inject CSS vars. No-ops when no tenant is resolved. */
  @Get()
  get(): Promise<SchoolBrandingDto> {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) return Promise.resolve({ brandColor: null, logoUrl: null });
    return this.branding.get(schoolId);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() body: Partial<SchoolBrandingDto>): Promise<SchoolBrandingDto> {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can update branding');
    }
    return this.branding.update(this.tenant.requireSchoolId(), body);
  }
}
