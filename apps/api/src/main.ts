import { loadEnvFiles } from './load-env';

loadEnvFiles();

// Sentry must be initialized before any other imports (instruments NestJS internals).
// No-op when SENTRY_DSN is not set.
import * as Sentry from '@sentry/node';
const sentryDsn = process.env['SENTRY_DSN'];
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env['NODE_ENV'] ?? 'development',
    tracesSampleRate: 0.1,
  });
}

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableShutdownHooks();

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }));

  app.use(cookieParser());

  const corsOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:4200';
  app.enableCors({ origin: corsOrigin, credentials: true });

  // NB: `whitelist: true` strips every property that lacks a class-validator
  // decorator. Our REST DTOs are plain TS types (no class metadata → pipe skips
  // them, so whitelist gave REST zero protection), while GraphQL `@InputType`
  // classes ARE classes — so whitelist silently stripped ALL their fields,
  // breaking every mutation input (password change errored, profile save no-op'd,
  // etc.). Keep `transform` for type coercion; drop whitelist. Inputs that want
  // strict validation should add class-validator decorators explicitly.
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
