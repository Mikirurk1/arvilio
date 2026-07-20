import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { AuthGuard } from '../guards/auth.guard';
import {
  SchoolSellerProfileService,
  type SchoolSellerProfileDto,
  type UpdateSchoolSellerProfileDto,
} from '../../application/school-seller-profile.service';

/** Merchant seller profile: public GET (legal pages), admin-only PATCH. */
@Controller('school/seller-profile')
export class SchoolSellerProfileController {
  constructor(
    private readonly seller: SchoolSellerProfileService,
    private readonly tenant: TenantContextService,
  ) {}

  /** Public: legal / offer pages. Empty defaults when no tenant resolved. */
  @Get()
  get(): Promise<SchoolSellerProfileDto> {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) {
      return Promise.resolve({
        schoolName: '',
        legalName: null,
        legalAddress: null,
        legalCountry: 'UA',
        supportEmail: null,
        supportPhone: null,
        mcc: '8299',
        termsOverrideMd: null,
        paymentRefundOverrideMd: null,
        isComplete: false,
      });
    }
    return this.seller.get(schoolId);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() body: UpdateSchoolSellerProfileDto): Promise<SchoolSellerProfileDto> {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can update the seller profile');
    }
    return this.seller.update(this.tenant.requireSchoolId(), body);
  }
}
