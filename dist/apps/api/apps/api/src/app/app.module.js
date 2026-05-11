"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const module_auth_1 = require("../../../../packages/backend/modules/module-auth/src/index.js");
const module_flashcards_1 = require("../../../../packages/backend/modules/module-flashcards/src/index.js");
const module_lessons_1 = require("../../../../packages/backend/modules/module-lessons/src/index.js");
const module_progress_1 = require("../../../../packages/backend/modules/module-progress/src/index.js");
const module_vocabulary_1 = require("../../../../packages/backend/modules/module-vocabulary/src/index.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            module_auth_1.AuthModule,
            module_vocabulary_1.VocabularyModule,
            module_flashcards_1.FlashcardsModule,
            module_lessons_1.LessonsModule,
            module_progress_1.ProgressModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map