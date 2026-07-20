import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { DEFAULT_LOCALE, resolveSchoolDefaultLocale, sanitizeEnabledLocales } from '@pkg/types';
import { AuthGuard } from '../guards/auth.guard';
import { SchoolLocaleService, type SchoolLocaleDto } from '../../application/school-locale.service';

/** G33 — school UI locale settings: default + offered set. Public GET, admin-only PATCH. */
@Controller('school/locale')
export class SchoolLocaleController {
  constructor(
    private readonly locale: SchoolLocaleService,
    private readonly tenant: TenantContextService,
  ) {}

  /** Public: chrome (switcher / layout) reads the offered locales. Platform defaults when tenant-less. */
  @Get()
  get(): Promise<SchoolLocaleDto> {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) {
      const enabledLocales = sanitizeEnabledLocales(null);
      return Promise.resolve({
        defaultLocale: resolveSchoolDefaultLocale(DEFAULT_LOCALE, enabledLocales),
        enabledLocales,
      });
    }
    return this.locale.get(schoolId);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(
    @Body() body: Partial<{ defaultLocale: string | null; enabledLocales: string[] }>,
  ): Promise<SchoolLocaleDto> {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can update locale settings');
    }
    return this.locale.update(this.tenant.requireSchoolId(), body);
  }
}
