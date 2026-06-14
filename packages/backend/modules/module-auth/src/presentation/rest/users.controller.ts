import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { UpdateMyProfileRequestDto } from '@pkg/types';
import { UsersService } from '../../application/users.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('students')
  async students(@CurrentUser() userId: string) {
    return this.users.listStudents(userId);
  }

  @Get('me/profile')
  async getMyProfile(@CurrentUser() userId: string) {
    return this.users.getMyProfile(userId);
  }

  @Post('me/profile')
  async updateMyProfile(
    @CurrentUser() userId: string,
    @Body() body: UpdateMyProfileRequestDto,
  ) {
    return this.users.updateMyProfile(userId, body);
  }

  @Post('me/password')
  async changeMyPassword(
    @CurrentUser() userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.users.changeMyPassword(userId, body);
  }
}
