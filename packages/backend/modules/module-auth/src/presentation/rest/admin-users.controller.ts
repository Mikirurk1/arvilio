import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { CreateAdminUserRequestDto } from '@pkg/types';
import { AuthService } from '../../application/auth.service';
import { mapUserToDto, type UserRoleName } from '../../shared/auth-user-map.util';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';

type CreateAccountBody = CreateAdminUserRequestDto;

@Controller('admin/users')
@UseGuards(AuthGuard)
export class AdminUsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@CurrentUser() userId: string) {
    const actor = await this.requireAdmin(userId);
    const users = await this.prisma.user.findMany({
      where:
        actor.role === 'ADMIN'
          ? { role: { in: ['STUDENT', 'TEACHER', 'ADMIN'] } }
          : { role: { not: 'SUPER_ADMIN' } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return users.map((user) => ({
      ...user,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
    }));
  }

  @Post()
  async create(@CurrentUser() userId: string, @Body() body: CreateAccountBody) {
    const actor = await this.requireAdmin(userId);
    const { user, welcomeEmailSent } = await this.authService.createUserAsAdmin(actor, body);
    return { user: mapUserToDto(user), welcomeEmailSent };
  }

  @Delete(':id')
  async remove(@CurrentUser() userId: string, @Param('id') targetId: string) {
    const actor = await this.requireAdmin(userId);
    await this.authService.deleteUserAsAdmin(actor, targetId);
    return { ok: true };
  }

  private async requireAdmin(userId: string): Promise<{ id: string; role: UserRoleName }> {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can manage accounts');
    }
    return { id: actor.id, role: actor.role };
  }
}
