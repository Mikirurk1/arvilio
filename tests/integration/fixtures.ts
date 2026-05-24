import type { PrismaClient } from '@prisma/client';
import { TEST_USERS } from './seed';

export async function getSeededUserIds(prisma: PrismaClient) {
  const student = await prisma.user.findUniqueOrThrow({
    where: { email: TEST_USERS.student.email },
  });
  const teacher = await prisma.user.findUniqueOrThrow({
    where: { email: TEST_USERS.teacher.email },
  });
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: TEST_USERS.admin.email },
  });
  return { studentId: student.id, teacherId: teacher.id, adminId: admin.id };
}
