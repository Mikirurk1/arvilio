import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { AuthGuard } from '../guards/auth.guard';
import { FeatureGuard, RequiresFeature } from '../guards/feature.guard';
import { DomainsService, type AddDomainDto, type SchoolDomainDto } from '../../application/domains.service';

@Controller('domains')
@UseGuards(AuthGuard)
export class DomainsController {
  constructor(
    private readonly domains: DomainsService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get()
  list(): Promise<SchoolDomainDto[]> {
    return this.domains.list(this.tenant.requireSchoolId());
  }

  @Post()
  @RequiresFeature('customDomain')
  @UseGuards(FeatureGuard)
  add(@Body() body: AddDomainDto): Promise<SchoolDomainDto> {
    this.requireAdmin();
    return this.domains.add(this.tenant.requireSchoolId(), body);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @RequiresFeature('customDomain')
  @UseGuards(FeatureGuard)
  verify(@Param('id') id: string): Promise<SchoolDomainDto> {
    this.requireAdmin();
    return this.domains.verify(this.tenant.requireSchoolId(), id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresFeature('customDomain')
  @UseGuards(FeatureGuard)
  async remove(@Param('id') id: string): Promise<void> {
    this.requireAdmin();
    return this.domains.remove(this.tenant.requireSchoolId(), id);
  }

  private requireAdmin(): void {
    const role = this.tenant.membershipRole;
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can manage domains');
    }
  }
}
