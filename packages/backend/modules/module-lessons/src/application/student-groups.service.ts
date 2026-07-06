import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import { PaymentSettingsService } from '@be/billing';
import type {
  CreateStudentGroupRequestDto,
  StudentGroupDto,
  UpdateStudentGroupRequestDto,
} from '@pkg/types';
import { isGroupLessonsEnabled, GROUP_LESSONS_FEATURE_DISABLED_MESSAGE } from '@pkg/types';
import { canJoinGroupLesson } from '../shared/lesson-format.util';
import {
  assertStudentGroupBillingInput,
  billingFieldsFromGroupInput,
  mapStudentGroup,
} from '../shared/student-group-map.util';

const TEACHING_ROLES = new Set(['TEACHER', 'ADMIN', 'SUPER_ADMIN']);

@Injectable()
export class StudentGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly paymentSettings: PaymentSettingsService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  /** Tenant-scoped client: StudentGroup reads/writes are auto-filtered by school. */
  private get db() {
    return this.tenantPrisma.client;
  }

  private async assertGroupLessonsFeatureEnabled(): Promise<void> {
    const { config } = await this.paymentSettings.getRuntimePaymentSettings();
    if (!isGroupLessonsEnabled(config)) {
      throw new BadRequestException(GROUP_LESSONS_FEATURE_DISABLED_MESSAGE);
    }
  }

  private async resolveActor(userId: string) {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!actor || !TEACHING_ROLES.has(actor.role)) {
      throw new ForbiddenException('Staff only');
    }
    return actor;
  }

  private assertAdmin(actor: { role: string }) {
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can manage student groups');
    }
  }

  private groupInclude() {
    return {
      teacher: { select: { displayName: true } },
      members: {
        include: { user: { select: { displayName: true } } },
        orderBy: { sortOrder: 'asc' as const },
      },
    };
  }

  async listForActor(actorUserId: string): Promise<StudentGroupDto[]> {
    await this.assertGroupLessonsFeatureEnabled();
    const actor = await this.resolveActor(actorUserId);
    const groups = await this.db.studentGroup.findMany({
      where: actor.role === 'TEACHER' ? { teacherId: actor.id } : undefined,
      include: this.groupInclude(),
      orderBy: { name: 'asc' },
    });
    return groups.map((group) => mapStudentGroup(group));
  }

  async getById(actorUserId: string, id: string): Promise<StudentGroupDto> {
    await this.assertGroupLessonsFeatureEnabled();
    const actor = await this.resolveActor(actorUserId);
    const group = await this.db.studentGroup.findUnique({
      where: { id },
      include: this.groupInclude(),
    });
    if (!group) throw new NotFoundException('Student group not found');
    if (actor.role === 'TEACHER' && group.teacherId !== actor.id) {
      throw new ForbiddenException();
    }
    return mapStudentGroup(group);
  }

  async create(actorUserId: string, body: CreateStudentGroupRequestDto): Promise<StudentGroupDto> {
    await this.assertGroupLessonsFeatureEnabled();
    const actor = await this.resolveActor(actorUserId);
    this.assertAdmin(actor);
    const name = body.name?.trim();
    if (!name) throw new BadRequestException('Group name is required');
    const memberUserIds = [...new Set((body.memberUserIds ?? []).map((id) => id.trim()).filter(Boolean))];
    if (memberUserIds.length < 2) {
      throw new BadRequestException('A group needs at least two students');
    }
    try {
      assertStudentGroupBillingInput({ ...body, memberUserIds });
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'Invalid billing');
    }
    await this.validateMembers(memberUserIds);
    if (body.teacherId) {
      await this.assertTeacher(body.teacherId);
    }
    const billing = billingFieldsFromGroupInput(body);
    const group = await this.db.studentGroup.create({
      data: {
        name,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        teacherId: body.teacherId ?? null,
        ...billing,
        members: {
          create: memberUserIds.map((userId, index) => ({
            userId,
            sortOrder: index,
          })),
        },
      },
      include: this.groupInclude(),
    });
    return mapStudentGroup(group);
  }

  async update(
    actorUserId: string,
    id: string,
    body: UpdateStudentGroupRequestDto,
  ): Promise<StudentGroupDto> {
    await this.assertGroupLessonsFeatureEnabled();
    const actor = await this.resolveActor(actorUserId);
    this.assertAdmin(actor);
    const existing = await this.db.studentGroup.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Student group not found');

    const memberUserIds =
      body.memberUserIds !== undefined
        ? [...new Set(body.memberUserIds.map((mid) => mid.trim()).filter(Boolean))]
        : undefined;
    if (memberUserIds && memberUserIds.length < 2) {
      throw new BadRequestException('A group needs at least two students');
    }

    const merged: CreateStudentGroupRequestDto = {
      name: body.name ?? existing.name,
      teacherId: body.teacherId !== undefined ? body.teacherId : existing.teacherId,
      memberUserIds:
        memberUserIds ??
        (
          await this.prisma.studentGroupMember.findMany({
            where: { studentGroupId: id },
            orderBy: { sortOrder: 'asc' },
          })
        ).map((row) => row.userId),
      groupBillingMode:
        body.groupBillingMode ??
        (existing.groupBillingMode === 'FIXED_TOTAL' ? 'fixed_total' : 'per_member'),
      groupPriceMinor: body.groupPriceMinor ?? existing.groupPriceMinor ?? undefined,
      groupCurrency: body.groupCurrency ?? existing.groupCurrency ?? undefined,
      groupSplitMode:
        body.groupSplitMode ??
        (existing.groupSplitMode === 'SINGLE_PAYER'
          ? 'single_payer'
          : existing.groupSplitMode === 'EQUAL_SPLIT'
            ? 'equal_split'
            : undefined),
      groupPayerUserId:
        body.groupPayerUserId !== undefined ? body.groupPayerUserId : existing.groupPayerUserId,
    };

    try {
      assertStudentGroupBillingInput(merged);
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'Invalid billing');
    }

    if (memberUserIds) await this.validateMembers(memberUserIds);
    if (body.teacherId) await this.assertTeacher(body.teacherId);

    const billing = billingFieldsFromGroupInput(merged);
    await this.db.$transaction(async (tx) => {
      await tx.studentGroup.update({
        where: { id },
        data: {
          name: body.name?.trim() || undefined,
          teacherId: body.teacherId !== undefined ? body.teacherId : undefined,
          ...billing,
        },
      });
      if (memberUserIds) {
        await tx.studentGroupMember.deleteMany({ where: { studentGroupId: id } });
        await tx.studentGroupMember.createMany({
          data: memberUserIds.map((userId, index) => ({
            studentGroupId: id,
            userId,
            sortOrder: index,
          })),
        });
      }
    });

    const group = await this.db.studentGroup.findUnique({
      where: { id },
      include: this.groupInclude(),
    });
    return mapStudentGroup(group!);
  }

  async remove(actorUserId: string, id: string): Promise<{ ok: true }> {
    await this.assertGroupLessonsFeatureEnabled();
    const actor = await this.resolveActor(actorUserId);
    this.assertAdmin(actor);
    const existing = await this.db.studentGroup.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Student group not found');
    await this.db.studentGroup.delete({ where: { id } });
    return { ok: true };
  }

  private async assertTeacher(teacherId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { role: true },
    });
    if (!teacher || !TEACHING_ROLES.has(teacher.role)) {
      throw new BadRequestException('Teacher not found');
    }
  }

  private async validateMembers(memberUserIds: string[]) {
    const students = await this.prisma.user.findMany({
      where: {
        id: { in: memberUserIds },
        role: 'STUDENT',
        // Tenant guard: `User` is global and not auto-scoped — block adding a
        // student from another school to this school's group.
        ...(this.tenant.schoolId
          ? { schoolMemberships: { some: { schoolId: this.tenant.schoolId, status: 'ACTIVE' } } }
          : {}),
      },
      select: { id: true, lessonFormat: true },
    });
    if (students.length !== memberUserIds.length) {
      throw new BadRequestException('One or more students were not found');
    }
    const blocked = students.find((student) => !canJoinGroupLesson(student.lessonFormat));
    if (blocked) {
      throw new BadRequestException(
        'One or more students are configured for individual lessons only',
      );
    }
  }
}
