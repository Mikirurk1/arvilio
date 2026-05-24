import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { createMockPrisma } from '../../../../../../tests/shared/prisma-mock';
import { deleteAdminUserAccount } from './delete-admin-user';

describe('deleteAdminUserAccount', () => {
  it('rejects deleting SUPER_ADMIN', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 't1', role: 'SUPER_ADMIN' });

    await expect(
      deleteAdminUserAccount(prisma as never, { id: 'admin', role: 'ADMIN' }, 't1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects admin deleting teacher', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 't1', role: 'TEACHER' });

    await expect(
      deleteAdminUserAccount(prisma as never, { id: 'admin', role: 'ADMIN' }, 't1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects self-delete', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'STUDENT' });

    await expect(
      deleteAdminUserAccount(prisma as never, { id: 'u1', role: 'ADMIN' }, 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes student in transaction', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });

    await deleteAdminUserAccount(prisma as never, { id: 'admin', role: 'ADMIN' }, 's1');

    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('throws when target user not found', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      deleteAdminUserAccount(prisma as never, { id: 'admin', role: 'ADMIN' }, 'missing'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows SUPER_ADMIN to delete teacher', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 't1', role: 'TEACHER' });

    await deleteAdminUserAccount(prisma as never, { id: 'sa', role: 'SUPER_ADMIN' }, 't1');

    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('maps Prisma P2003 to friendly BadRequest', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });
    prisma.$transaction.mockRejectedValue({ code: 'P2003' });

    await expect(
      deleteAdminUserAccount(prisma as never, { id: 'admin', role: 'ADMIN' }, 's1'),
    ).rejects.toThrow(/related records still exist/);
  });

  it('rethrows unknown transaction errors', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 's1', role: 'STUDENT' });
    prisma.$transaction.mockRejectedValue(new Error('db down'));

    await expect(
      deleteAdminUserAccount(prisma as never, { id: 'admin', role: 'ADMIN' }, 's1'),
    ).rejects.toThrow('db down');
  });
});
