"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const apollo_1 = require("@nestjs/apollo");
const default_1 = require("@apollo/server/plugin/landingPage/default");
const graphql_1 = require("@nestjs/graphql");
const app_controller_1 = require("./app.controller");
const app_resolver_1 = require("./app.resolver");
const app_service_1 = require("./app.service");
const domain_resolvers_1 = require("../graphql/domain.resolvers");
const chat_resolver_1 = require("../graphql/chat.resolver");
const data_access_prisma_1 = require("../../../../packages/backend/data-access/data-access-prisma/src/index.js");
const module_auth_1 = require("../../../../packages/backend/modules/module-auth/src/index.js");
const module_mail_1 = require("../../../../packages/backend/modules/module-mail/src/index.js");
const module_flashcards_1 = require("../../../../packages/backend/modules/module-flashcards/src/index.js");
const module_lessons_1 = require("../../../../packages/backend/modules/module-lessons/src/index.js");
const module_progress_1 = require("../../../../packages/backend/modules/module-progress/src/index.js");
const module_vocabulary_1 = require("../../../../packages/backend/modules/module-vocabulary/src/index.js");
const module_notifications_1 = require("../../../../packages/backend/modules/module-notifications/src/index.js");
const module_chat_1 = require("../../../../packages/backend/modules/module-chat/src/index.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            data_access_prisma_1.PrismaModule,
            module_mail_1.MailModule,
            module_auth_1.AuthModule,
            module_notifications_1.NotificationsModule,
            module_chat_1.ChatModule,
            module_vocabulary_1.VocabularyModule,
            module_flashcards_1.FlashcardsModule,
            module_lessons_1.LessonsModule,
            module_progress_1.ProgressModule,
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: true,
                path: 'graphql',
                sortSchema: true,
                useGlobalPrefix: true,
                playground: false,
                introspection: true,
                plugins: [(0, default_1.ApolloServerPluginLandingPageLocalDefault)({ embed: true })],
                context: ({ req, res }) => ({ req, res }),
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            app_resolver_1.AppResolver,
            domain_resolvers_1.DashboardResolver,
            domain_resolvers_1.VocabularyResolver,
            domain_resolvers_1.QuizzesResolver,
            domain_resolvers_1.LessonsResolver,
            domain_resolvers_1.UsersResolver,
            domain_resolvers_1.LanguagesResolver,
            domain_resolvers_1.AdminResolver,
            domain_resolvers_1.SystemResolver,
            chat_resolver_1.ChatResolver,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map