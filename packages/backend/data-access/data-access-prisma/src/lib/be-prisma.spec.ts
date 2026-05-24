import { Test } from '@nestjs/testing';

const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDisconnect = jest.fn().mockResolvedValue(undefined);

jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
  },
}));

jest.mock('@prisma/adapter-pg', () => {
  const PrismaPg = jest.fn(function PrismaPg(
    this: { connectionString: string },
    config: { connectionString: string },
  ) {
    this.connectionString = config.connectionString;
  });
  return { PrismaPg };
});

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaModule, PrismaService } from './be-prisma';

const PrismaPgMock = PrismaPg as jest.MockedClass<typeof PrismaPg>;

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
    jest.clearAllMocks();
  });

  it('connects on init and disconnects on destroy', async () => {
    const service = new PrismaService();
    await service.onModuleInit();
    await service.onModuleDestroy();
    expect(mockConnect).toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('builds adapter from DATABASE_URL when set', () => {
    process.env.DATABASE_URL = 'postgresql://custom:secret@localhost:5432/app';
    new PrismaService();
    expect(PrismaPgMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://custom:secret@localhost:5432/app',
    });
  });

  it('uses default connection string when DATABASE_URL is unset', () => {
    delete process.env.DATABASE_URL;
    new PrismaService();
    expect(PrismaPgMock).toHaveBeenCalledWith({
      connectionString:
        'postgresql://soenglish:soenglish@localhost:5432/soenglish?schema=public',
    });
  });

  it('PrismaModule registers PrismaService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    const service = moduleRef.get(PrismaService);
    expect(service).toBeInstanceOf(PrismaService);
  });
});
