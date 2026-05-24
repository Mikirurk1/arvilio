import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from '../../application/dashboard.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  async summary(@CurrentUser() userId: string) {
    return this.dashboard.summaryFor(userId);
  }
}
