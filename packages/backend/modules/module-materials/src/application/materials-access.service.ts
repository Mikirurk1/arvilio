import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

export type MaterialsStaffRole = 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

@Injectable()
export class MaterialsAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertStaff(userId: string): Promise<{ id: string; role: MaterialsStaffRole }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new UnauthorizedException();
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only staff can manage the materials library');
    }
    return { id: user.id, role: user.role as MaterialsStaffRole };
  }

  async assertCanDownloadMaterial(userId: string, materialId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new UnauthorizedException();
    if (user.role === 'TEACHER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return;
    }

    const linkedLesson = await this.prisma.lessonMaterial.findFirst({
      where: {
        libraryMaterialId: materialId,
        lesson: {
          OR: [{ teacherId: userId }, { studentId: userId }],
        },
      },
      select: { id: true },
    });
    if (!linkedLesson) {
      throw new ForbiddenException('You do not have access to this material');
    }
  }

  async assertCanViewStudent(viewerId: string, studentId: string): Promise<void> {
    if (viewerId === studentId) return;
    await this.assertStaff(viewerId);
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true, teacherId: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      select: { role: true },
    });
    if (viewer?.role === 'TEACHER' && student.teacherId !== viewerId) {
      throw new ForbiddenException('You can only view annotations for your students');
    }
  }
}
