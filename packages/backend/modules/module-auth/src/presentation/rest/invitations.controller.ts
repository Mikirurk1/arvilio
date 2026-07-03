import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, Roles, RolesGuard } from '@be/auth';
import { InvitationsService, type CreateInvitationDto } from '../../application/invitations.service';

/**
 * School-admin-only invitation endpoints (require ADMIN membership role).
 *
 * POST   /schools/invitations         — create & send
 * GET    /schools/invitations         — list all for the active school
 * DELETE /schools/invitations/:id     — revoke pending invitation
 * POST   /schools/invitations/accept  — authenticated user accepts by token
 */
@Controller('schools/invitations')
@UseGuards(AuthGuard, RolesGuard)
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() userId: string,
  ) {
    return this.invitations.create(dto, userId);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  list() {
    return this.invitations.list();
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  revoke(@Param('id') id: string) {
    return this.invitations.revoke(id);
  }

  @Post('accept')
  @UseGuards(AuthGuard)
  accept(
    @Body('token') token: string,
    @CurrentUser() userId: string,
  ) {
    return this.invitations.accept(token, userId);
  }
}
