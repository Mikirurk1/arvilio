import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';
import {
  SchoolOnboardingService,
  type OnboardingStateDto,
} from '../../application/school-onboarding.service';
import { UserTourService, type TourStateDto } from '../../application/user-tour.service';

/**
 * Resumable signup wizard state (Phase 4.5.3, G30). All routes run in the current
 * admin's tenant context (schoolId from CLS via AuthGuard).
 */
@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(
    private readonly onboarding: SchoolOnboardingService,
    private readonly tour: UserTourService,
  ) {}

  @Get()
  getState(): Promise<OnboardingStateDto> {
    return this.onboarding.getState();
  }

  @Patch('step')
  saveStep(
    @Body() body: { step: string; data?: Record<string, unknown> },
  ): Promise<OnboardingStateDto> {
    return this.onboarding.saveStep(body?.step, body?.data ?? {});
  }

  @Post('complete')
  complete(): Promise<OnboardingStateDto> {
    return this.onboarding.complete();
  }

  // --- First-login product tour (user-scoped, Phase 4.5.4) ---

  @Get('tour')
  tourState(@CurrentUser() userId: string): Promise<TourStateDto> {
    return this.tour.getState(userId);
  }

  @Post('tour/complete')
  completeTour(@CurrentUser() userId: string): Promise<TourStateDto> {
    return this.tour.complete(userId);
  }

  @Post('tour/reset')
  resetTour(@CurrentUser() userId: string): Promise<TourStateDto> {
    return this.tour.reset(userId);
  }
}
