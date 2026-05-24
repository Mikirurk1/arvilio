import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { PrismaService } from '@be/prisma';

type UserRoleName = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

export async function deleteAdminUserAccount(
  prisma: PrismaService,
  actor: { id: string; role: UserRoleName },
  targetId: string,
): Promise<void> {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw new BadRequestException('User not found');
  if (target.role === 'SUPER_ADMIN') {
    throw new ForbiddenException('SUPER_ADMIN accounts can only be managed via CLI');
  }
  if (actor.role === 'ADMIN' && target.role !== 'STUDENT') {
    throw new ForbiddenException('Admins can only delete student accounts');
  }
  if (target.id === actor.id) {
    throw new BadRequestException('Cannot delete your own account');
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.scheduledLesson.deleteMany({
        where: {
          OR: [{ studentId: targetId }, { teacherId: targetId }],
        },
      });
      await tx.user.delete({ where: { id: targetId } });
    });
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: string }).code)
        : '';
    if (code === 'P2003') {
      throw new BadRequestException(
        'Cannot delete this user because related records still exist. Contact support or remove linked data first.',
      );
    }
    throw error;
  }
}
