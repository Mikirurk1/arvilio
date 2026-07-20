import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { AuthGuard } from '../guards/auth.guard';
import {
  SchoolTeachingPrefsService,
  type SchoolTeachingPrefsDto,
} from '../../application/school-teaching-prefs.service';

/** School teaching prefs (languages + delivery format). Auth GET, admin PATCH. */
@Controller('school/teaching-prefs')
export class SchoolTeachingPrefsController {
  constructor(
    private readonly teachingPrefs: SchoolTeachingPrefsService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  get(): Promise<SchoolTeachingPrefsDto> {
    return this.teachingPrefs.get(this.tenant.requireSchoolId());
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(
    @Body() body: Partial<{ languages: string[]; lessonFormat: string }>,
  ): Promise<SchoolTeachingPrefsDto> {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can update teaching preferences');
    }
    return this.teachingPrefs.update(this.tenant.requireSchoolId(), body);
  }
}
