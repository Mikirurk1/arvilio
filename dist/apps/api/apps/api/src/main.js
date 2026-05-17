"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const load_env_1 = require("./load-env");
(0, load_env_1.loadEnvFiles)();
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const app_module_1 = require("./app/app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.enableShutdownHooks();
    app.use((0, cookie_parser_1.default)());
    const corsOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:4200';
    app.enableCors({ origin: corsOrigin, credentials: true });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map