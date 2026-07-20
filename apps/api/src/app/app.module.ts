import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { PrismaModule } from '@be/prisma';
import { TenantModule } from '@be/tenant';
import { FileStorageModule } from '@be/storage';
import { AuthModule } from '@be/auth';
import { MailModule } from '@be/mail';
import { FlashcardsModule } from '@be/flashcards';
import { SpeakingModule } from '@be/speaking';
import { MaterialsModule } from '@be/materials';
import { LessonsModule } from '@be/lessons';
import { ProgressModule } from '@be/progress';
import { AssistantModule } from '@be/assistant';
import { VocabularyModule } from '@be/vocabulary';
import { NotificationsModule } from '@be/notifications';
import { ChatModule } from '@be/chat';
import { BillingModule } from '@be/billing';
import { PlatformAdminModule } from '@be/platform-admin';
import { TenantResolutionMiddleware } from './tenant-resolution.middleware';
import { GqlThrottlerGuard } from './gql-throttler.guard';
import { TenantLoggingInterceptor } from './tenant-logging.interceptor';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      // Nest applies EVERY named throttler in forRoot to all routes. Putting
      // `auth` (10/15min) here previously rate-limited GraphQL after ~10 clicks.
      // Auth endpoints tighten `global` via @Throttle({ global: { … } }).
      { name: 'global', ttl: 60_000, limit: 300 },
    ]),
    ScheduleModule.forRoot(),
    TenantModule,
    FileStorageModule,
    PrismaModule,
    MailModule,
    AuthModule,
    BillingModule,
    NotificationsModule,
    ChatModule,
    VocabularyModule,
    FlashcardsModule,
    SpeakingModule,
    MaterialsModule,
    LessonsModule,
    ProgressModule,
    AssistantModule,
    PlatformAdminModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: 'graphql',
      sortSchema: true,
      useGlobalPrefix: true,
      playground: false,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver,
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantLoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  // Phase 2: resolve the active tenant from the Host header before guards run,
  // so public/unauthenticated requests carry the right schoolId. Runs within the
  // CLS context mounted by TenantModule; a no-op when no host maps to a tenant.
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantResolutionMiddleware).forRoutes('*');
  }
}
