import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import {
  AdminResolver,
  LanguagesResolver,
  SystemResolver,
  DashboardResolver,
  LessonsResolver,
  QuizzesResolver,
  UsersResolver,
  VocabularyResolver,
} from '../graphql/domain.resolvers';
import { ChatResolver } from '../graphql/chat.resolver';
import { PrismaModule } from '@soenglish/data-access-prisma';
import { AuthModule } from '@soenglish/module-auth';
import { MailModule } from '@soenglish/module-mail';
import { FlashcardsModule } from '@soenglish/module-flashcards';
import { LessonsModule } from '@soenglish/module-lessons';
import { ProgressModule } from '@soenglish/module-progress';
import { VocabularyModule } from '@soenglish/module-vocabulary';
import { NotificationsModule } from '@soenglish/module-notifications';
import { ChatModule } from '@soenglish/module-chat';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    AuthModule,
    NotificationsModule,
    ChatModule,
    VocabularyModule,
    FlashcardsModule,
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
  providers: [
    AppService,
    AppResolver,
    DashboardResolver,
    VocabularyResolver,
    QuizzesResolver,
    LessonsResolver,
    UsersResolver,
    LanguagesResolver,
    AdminResolver,
    SystemResolver,
    ChatResolver,
  ],
})
export class AppModule {}
