import { forwardRef, Global, Module } from '@nestjs/common';
import { BillingModule } from '@be/billing';
import { MailModule } from '@be/mail';
import { NotificationsModule } from '@be/notifications';
import { PrismaModule } from '@be/prisma';
import { AdminUsersGraphqlService } from './application/admin-users-graphql.service';
import { CaptchaService } from './application/captcha.service';
import { AchievementStatsService } from './application/achievement-stats.service';
import { AuthSessionService } from './application/auth-session.service';
import { AuthService } from './application/auth.service';
import { SchoolSignupService } from './application/school-signup.service';
import { SchoolOnboardingService } from './application/school-onboarding.service';
import { UserTourService } from './application/user-tour.service';
import { DailyGoalProgressService } from './application/daily-goal-progress.service';
import { DailyGoalsService } from './application/daily-goals.service';
import { StatisticsDashboardService } from './application/statistics-dashboard.service';
import { DashboardService } from './application/dashboard.service';
import { LanguagesService } from './application/languages.service';
import { PracticeSessionsService } from './application/practice-sessions.service';
import { StudentsAdminService } from './application/students-admin.service';
import { TelegramLinkService } from './application/telegram-link.service';
import { UsersService } from './application/users.service';
import { AuthGuard, OptionalAuthGuard } from './presentation/guards/auth.guard';
import { GqlAuthGuard } from './presentation/guards/gql-auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';
import { FeatureGuard } from './presentation/guards/feature.guard';
import { AdminStudentsController } from './presentation/rest/admin-students.controller';
import { AdminUsersController } from './presentation/rest/admin-users.controller';
import { AuthController } from './presentation/rest/auth.controller';
import { DashboardController } from './presentation/rest/dashboard.controller';
import { OnboardingController } from './presentation/rest/onboarding.controller';
import { EntitlementsController } from './presentation/rest/entitlements.controller';
import { SubscriptionController } from './presentation/rest/subscription.controller';
import { LanguagesController } from './presentation/rest/languages.controller';
import { UsersController } from './presentation/rest/users.controller';
import { InvitationsController } from './presentation/rest/invitations.controller';
import { DomainsController } from './presentation/rest/domains.controller';
import { SchoolBrandingController } from './presentation/rest/school-branding.controller';
import { SchoolBrandingService } from './application/school-branding.service';
import { ImportStudentsController } from './presentation/rest/import-students.controller';
import { GdprController, PlatformGdprController } from './presentation/rest/gdpr.controller';
import { GdprService } from './application/gdpr.service';
import { InvitationsService } from './application/invitations.service';
import { DomainsService } from './application/domains.service';
import { ImportStudentsService } from './application/import-students.service';
import { SampleContentService } from './application/sample-content.service';
import { AdminResolver } from './presentation/graphql/admin.resolver';
import { DashboardResolver } from './presentation/graphql/dashboard.resolver';
import { LanguagesResolver } from './presentation/graphql/languages.resolver';
import { UsersResolver } from './presentation/graphql/users.resolver';

@Global()
@Module({
  imports: [PrismaModule, MailModule, BillingModule, forwardRef(() => NotificationsModule)],
  controllers: [
    AuthController,
    AdminUsersController,
    AdminStudentsController,
    LanguagesController,
    UsersController,
    DashboardController,
    OnboardingController,
    EntitlementsController,
    SubscriptionController,
    InvitationsController,
    DomainsController,
    SchoolBrandingController,
    ImportStudentsController,
    GdprController,
    PlatformGdprController,
  ],
  providers: [
    AuthService,
    CaptchaService,
    SchoolSignupService,
    SchoolOnboardingService,
    UserTourService,
    AchievementStatsService,
    AdminUsersGraphqlService,
    AuthSessionService,
    DashboardService,
    DailyGoalProgressService,
    DailyGoalsService,
    StatisticsDashboardService,
    PracticeSessionsService,
    LanguagesService,
    StudentsAdminService,
    UsersService,
    TelegramLinkService,
    InvitationsService,
    DomainsService,
    SchoolBrandingService,
    ImportStudentsService,
    GdprService,
    SampleContentService,
    AuthGuard,
    OptionalAuthGuard,
    GqlAuthGuard,
    RolesGuard,
    FeatureGuard,
    DashboardResolver,
    LanguagesResolver,
    UsersResolver,
    AdminResolver,
  ],
  exports: [
    AuthService,
    AchievementStatsService,
    AuthSessionService,
    DashboardService,
    DailyGoalsService,
    PracticeSessionsService,
    LanguagesService,
    StudentsAdminService,
    UsersService,
    AuthGuard,
    OptionalAuthGuard,
    GqlAuthGuard,
    RolesGuard,
    FeatureGuard,
    TelegramLinkService,
  ],
})
export class AuthModule {}

export { ACCESS_COOKIE, REFRESH_COOKIE } from './shared/auth-cookies';
