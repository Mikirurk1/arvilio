import { forwardRef, Global, Module } from '@nestjs/common';
import { BillingModule } from '@be/billing';
import { MailModule } from '@be/mail';
import { NotificationsModule } from '@be/notifications';
import { PrismaModule } from '@be/prisma';
import { AdminUsersGraphqlService } from './application/admin-users-graphql.service';
import { AchievementStatsService } from './application/achievement-stats.service';
import { AuthSessionService } from './application/auth-session.service';
import { AuthService } from './application/auth.service';
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
import { AdminStudentsController } from './presentation/rest/admin-students.controller';
import { AdminUsersController } from './presentation/rest/admin-users.controller';
import { AuthController } from './presentation/rest/auth.controller';
import { DashboardController } from './presentation/rest/dashboard.controller';
import { LanguagesController } from './presentation/rest/languages.controller';
import { UsersController } from './presentation/rest/users.controller';
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
  ],
  providers: [
    AuthService,
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
    AuthGuard,
    OptionalAuthGuard,
    GqlAuthGuard,
    RolesGuard,
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
    TelegramLinkService,
  ],
})
export class AuthModule {}

export { ACCESS_COOKIE, REFRESH_COOKIE } from './shared/auth-cookies';
