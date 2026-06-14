import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { PrismaModule } from '@be/prisma';
import { AuthModule } from '@be/auth';
import { MailModule } from '@be/mail';
import { FlashcardsModule } from '@be/flashcards';
import { SpeakingModule } from '@be/speaking';
import { MaterialsModule } from '@be/materials';
import { LessonsModule } from '@be/lessons';
import { ProgressModule } from '@be/progress';
import { VocabularyModule } from '@be/vocabulary';
import { NotificationsModule } from '@be/notifications';
import { ChatModule } from '@be/chat';
import { BillingModule } from '@be/billing';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
  providers: [AppService, AppResolver],
})
export class AppModule {}
