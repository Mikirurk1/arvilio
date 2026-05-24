import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { PrismaService } from '@be/prisma';
import { AppModule } from '../../apps/api/src/app/app.module';
import { seedTestUsers } from './seed';

export type IntegrationContext = {
  app: INestApplication;
  prisma: PrismaService;
};

export async function createIntegrationApp(): Promise<IntegrationContext> {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'integration-test-jwt-secret-32chars';
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  await app.init();

  const prisma = moduleRef.get(PrismaService);
  await seedTestUsers(prisma);

  return { app, prisma };
}

export async function closeIntegrationApp(ctx: IntegrationContext): Promise<void> {
  await ctx.app.close();
}
