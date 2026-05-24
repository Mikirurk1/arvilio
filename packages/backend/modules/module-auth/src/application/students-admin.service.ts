import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { UpdateAdminStudentRequestDto } from '@pkg/types';
import { LanguagesService } from './languages.service';
import { normalizeDisplayColor } from '../shared/display-color';

const TEACHING_ROLES = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'] as const;
type StaffActorRole = 'ADMIN' | 'SUPER_ADMIN' | 'TEACHER';

@Injectable()
export class StudentsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly languages: LanguagesService,
  ) {}

  async resolveStaffActor(userId: string): Promise<{ role: StaffActorRole; id: string }> {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (
      !actor ||
      (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN' && actor.role !== 'TEACHER')
    ) {
      throw new ForbiddenException('Only staff can update student admin fields');
    }
    return { role: actor.role as StaffActorRole, id: userId };
  }

  async updateStudentLanguages(
    actorUserId: string,
    studentId: string,
    body: UpdateAdminStudentRequestDto,
  ) {
    const actor = await this.resolveStaffActor(actorUserId);
    return this.updateStudent(actor, studentId, body);
  }

  async updateStudent(
    actor: { role: StaffActorRole; id: string },
    studentId: string,
    body: UpdateAdminStudentRequestDto,
  ): Promise<{
    id: string;
    nativeLanguageId: string | null;
    learningLanguageIds: string[];
    teacherId: string | null;
    displayColor: string | null;
  }> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true, teacherId: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.role !== 'STUDENT') {
      throw new BadRequestException('User is not a student');
    }
    if (actor.role === 'TEACHER') {
      if (student.teacherId !== actor.id) {
        throw new ForbiddenException('You can only update your own students');
      }
      const hasRestrictedField =
        body.nativeLanguageId !== undefined ||
        body.learningLanguageIds !== undefined ||
        body.teacherId !== undefined ||
        body.scheduleType !== undefined;
      if (hasRestrictedField) {
        throw new ForbiddenException('Teachers can only update user color');
      }
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

    let displayColor: string | null | undefined;
    if (body.displayColor !== undefined) {
      try {
        displayColor = normalizeDisplayColor(body.displayColor);
      } catch {
        throw new BadRequestException('User color must be a #RRGGBB hex value');
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
      if (body.scheduleType !== undefined) {
        await tx.user.update({
          where: { id: studentId },
          data: { scheduleType: body.scheduleType },
        });
      }
      if (displayColor !== undefined) {
        await tx.user.update({
          where: { id: studentId },
          data: { displayColor },
        });
      }
    });

    const updated = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        nativeLanguageId: true,
        teacherId: true,
        displayColor: true,
        learningLanguages: { select: { languageId: true } },
      },
    });
    return {
      id: updated!.id,
      nativeLanguageId: updated!.nativeLanguageId,
      learningLanguageIds: updated!.learningLanguages.map((l) => l.languageId),
      teacherId: updated!.teacherId,
      displayColor: updated!.displayColor,
    };
  }
}
