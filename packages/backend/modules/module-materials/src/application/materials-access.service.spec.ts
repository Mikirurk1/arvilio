import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MaterialsAccessService } from './materials-access.service';

describe('MaterialsAccessService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    lessonMaterial: { findFirst: jest.fn() },
  };

  const service = new MaterialsAccessService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assertCanViewStudent', () => {
    it('allows self', async () => {
      await expect(service.assertCanViewStudent('student-1', 'student-1')).resolves.toBeUndefined();
    });

    it('allows teacher for assigned student', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ role: 'TEACHER' })
        .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 'teacher-1' });

      await expect(service.assertCanViewStudent('teacher-1', 'student-1')).resolves.toBeUndefined();
    });

    it('blocks teacher for unassigned student', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ role: 'TEACHER' })
        .mockResolvedValueOnce({ role: 'STUDENT', teacherId: 'teacher-2' })
        .mockResolvedValueOnce({ role: 'TEACHER' });

      await expect(service.assertCanViewStudent('teacher-1', 'student-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws when student not found', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ role: 'ADMIN' })
        .mockResolvedValueOnce(null);

      await expect(service.assertCanViewStudent('admin-1', 'missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
