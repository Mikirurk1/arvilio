import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import type { UpdateAdminStudentRequestDto } from '@soenglish/shared-types';
import { LanguagesService } from './languages.service';

const TEACHING_ROLES = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'] as const;

@Injectable()
export class StudentsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly languages: LanguagesService,
  ) {}

  async updateStudent(
    actorRole: 'ADMIN' | 'SUPER_ADMIN',
    studentId: string,
    body: UpdateAdminStudentRequestDto,
  ): Promise<{
    id: string;
    nativeLanguageId: string | null;
    learningLanguageIds: string[];
    teacherId: string | null;
  }> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.role !== 'STUDENT') {
      throw new BadRequestException('User is not a student');
    }
    if (actorRole === 'ADMIN' && student.role !== 'STUDENT') {
      throw new ForbiddenException('Admins can only update student accounts');
    }

    if (body.nativeLanguageId !== undefined && body.nativeLanguageId !== null) {
      await this.languages.assertLanguageIds([body.nativeLanguageId]);
    }
    if (body.learningLanguageIds !== undefined) {
      await this.languages.assertLanguageIds(body.learningLanguageIds);
    }
    if (body.teacherId !== undefined && body.teacherId !== null) {
      const teacher = await this.prisma.user.findUnique({
        where: { id: body.teacherId },
        select: { role: true },
      });
      if (!teacher || !TEACHING_ROLES.includes(teacher.role as (typeof TEACHING_ROLES)[number])) {
        throw new BadRequestException('Teacher not found or not eligible to teach');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (body.nativeLanguageId !== undefined) {
        await tx.user.update({
          where: { id: studentId },
          data: { nativeLanguageId: body.nativeLanguageId },
        });
      }
      if (body.learningLanguageIds !== undefined) {
        await tx.studentLearningLanguage.deleteMany({ where: { userId: studentId } });
        if (body.learningLanguageIds.length > 0) {
          await tx.studentLearningLanguage.createMany({
            data: body.learningLanguageIds.map((languageId) => ({
              userId: studentId,
              languageId,
            })),
          });
        }
      }
      if (body.teacherId !== undefined) {
        await tx.user.update({
          where: { id: studentId },
          data: { teacherId: body.teacherId },
        });
      }
    });

    const updated = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        nativeLanguageId: true,
        teacherId: true,
        learningLanguages: { select: { languageId: true } },
      },
    });
    return {
      id: updated!.id,
      nativeLanguageId: updated!.nativeLanguageId,
      learningLanguageIds: updated!.learningLanguages.map((l) => l.languageId),
      teacherId: updated!.teacherId,
    };
  }
}
