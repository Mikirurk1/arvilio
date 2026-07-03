import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async health(): Promise<{ status: 'ok' | 'degraded'; db: 'ok' | 'error'; ts: string }> {
    let db: 'ok' | 'error' = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }
    return { status: db === 'ok' ? 'ok' : 'degraded', db, ts: new Date().toISOString() };
  }
}
