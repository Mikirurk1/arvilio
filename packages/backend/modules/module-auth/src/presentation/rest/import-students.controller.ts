import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';
import {
  ImportStudentsService,
  type ImportConfirmDto,
  type ImportPreviewDto,
  type ImportRow,
} from '../../application/import-students.service';
import { type UserRoleName } from '../../application/auth.service';

interface ConfirmBody {
  rows: ImportRow[];
}

@Controller('admin/users/import')
@UseGuards(AuthGuard)
export class ImportStudentsController {
  constructor(
    private readonly importer: ImportStudentsService,
    private readonly tenant: TenantContextService,
  ) {}

  /** Dry-run: parse CSV text, return valid rows + errors + seat-cap info. */
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  preview(@Body('csv') csv: string): Promise<ImportPreviewDto> {
    this.requireAdmin();
    if (typeof csv !== 'string' || !csv.trim()) {
      throw new BadRequestException('csv body field is required');
    }
    return this.importer.preview(csv);
  }

  /** Confirm: create users for the valid rows returned by preview. */
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(
    @CurrentUser() userId: string,
    @Body() body: ConfirmBody,
  ): Promise<ImportConfirmDto> {
    this.requireAdmin();
    if (!Array.isArray(body?.rows) || body.rows.length === 0) {
      throw new BadRequestException('rows array is required');
    }
    const role = (this.tenant.membershipRole ?? 'STUDENT') as UserRoleName;
    return this.importer.confirm({ id: userId, role }, body.rows);
  }

  private requireAdmin(): void {
    const role = this.tenant.membershipRole;
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can import students');
    }
  }
}
