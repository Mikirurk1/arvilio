import { BadRequestException, ForbiddenException } from '@nestjs/common';

jest.mock('@be/billing', () => ({
  PaymentSettingsService: class PaymentSettingsService {},
}));

import { GROUP_LESSONS_FEATURE_DISABLED_MESSAGE } from '@pkg/types';
import { StudentGroupsService } from './student-groups.service';

describe('StudentGroupsService feature flag', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    studentGroup: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    studentGroupMember: { findMany: jest.fn() },
  };

  const paymentSettingsMock = {
    getRuntimePaymentSettings: jest.fn(),
  };

  const service = new StudentGroupsService(prisma as never, paymentSettingsMock as never);

  beforeEach(() => {
    jest.clearAllMocks();
    paymentSettingsMock.getRuntimePaymentSettings.mockResolvedValue({
      config: { groupLessons: { enabled: false } },
    });
  });

  it.each([
    ['listForActor', () => service.listForActor('admin-1')],
    ['getById', () => service.getById('admin-1', 'group-1')],
    [
      'create',
      () =>
        service.create('admin-1', {
          name: 'Group A',
          memberUserIds: ['s1', 's2'],
          groupBillingMode: 'per_member',
        }),
    ],
    [
      'update',
      () =>
        service.update('admin-1', 'group-1', {
          name: 'Group A',
        }),
    ],
    ['remove', () => service.remove('admin-1', 'group-1')],
  ])('%s rejects when group lessons are disabled', async (_name, run) => {
    await expect(run()).rejects.toThrow(BadRequestException);
    await expect(run()).rejects.toThrow(GROUP_LESSONS_FEATURE_DISABLED_MESSAGE);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('listForActor proceeds when feature is enabled', async () => {
    paymentSettingsMock.getRuntimePaymentSettings.mockResolvedValue({
      config: { groupLessons: { enabled: true } },
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    prisma.studentGroup.findMany.mockResolvedValue([]);

    await expect(service.listForActor('admin-1')).resolves.toEqual([]);
    expect(prisma.studentGroup.findMany).toHaveBeenCalled();
  });

  it('create still requires admin when feature is enabled', async () => {
    paymentSettingsMock.getRuntimePaymentSettings.mockResolvedValue({
      config: { groupLessons: { enabled: true } },
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'teacher-1', role: 'TEACHER' });

    await expect(
      service.create('teacher-1', {
        name: 'Group A',
        memberUserIds: ['s1', 's2'],
        groupBillingMode: 'per_member',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
