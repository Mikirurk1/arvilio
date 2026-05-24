/** Minimal PrismaClient mock for unit tests — extend per suite as needed. */
export type MockPrisma = {
  user: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  $transaction: jest.Mock;
  scheduledLesson: { deleteMany: jest.Mock };
  [key: string]: unknown;
};

export function createMockPrisma(overrides: Partial<MockPrisma> = {}): MockPrisma {
  const tx = {
    scheduledLesson: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    user: { delete: jest.fn().mockResolvedValue({}) },
  };
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    scheduledLesson: { deleteMany: jest.fn() },
    $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    ...overrides,
  } as MockPrisma;
}
