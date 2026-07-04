import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import * as bcrypt from 'bcryptjs';
import type {
  AssignableTeacherDto,
  ChangePasswordRequestDto,
  MyProfileDto,
  ProfileLinkedAccountDto,
  ProfileNotificationPrefs,
  StudentSummaryBackendDto,
  UpdateMyProfileRequestDto,
  UpdateStaffUserProfileRequestDto,
} from '@pkg/types';
import { normalizeLocale } from '@pkg/types';
import { LanguagesService } from './languages.service';

const TEACHING_ROLES = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'] as const;

type UserProfileRow = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  locale: string | null;
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  phone: string | null;
  telegram: string | null;
  bio: string | null;
  nativeLanguageId: string | null;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'PAUSED' | 'LEAVED' | 'BLOCKED';
  notifyLessonReminder: boolean;
  notifyStreakAlert: boolean;
  notifyWeeklyReport: boolean;
  notifyNewVocab: boolean;
  notifyTeacherMessages: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly languages: LanguagesService,
    private readonly tenant: TenantContextService,
  ) {}

  /**
   * Restrict a student query to the active tenant. `User` is a global identity
   * (not row-scoped by schoolId), so tenant isolation is enforced via an ACTIVE
   * `SchoolMembership` in the current school. Without this, a school admin could
   * read every student on the platform.
   */
  private tenantStudentFilter(): Prisma.UserWhereInput {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) return {};
    return { schoolMemberships: { some: { schoolId, status: 'ACTIVE' } } };
  }

  async listStudents(actorUserId: string): Promise<StudentSummaryBackendDto[]> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role === 'STUDENT') {
      throw new ForbiddenException('Students section is available only for staff roles');
    }
    const students = await this.prisma.user.findMany({
      where: {
        AND: [
          actor.role === 'TEACHER'
            ? { role: 'STUDENT', teacherId: actor.id }
            : { role: 'STUDENT' },
          this.tenantStudentFilter(),
        ],
      },
      include: {
        teacher: { select: { id: true, displayName: true } },
        learningLanguages: { select: { languageId: true } },
      },
      orderBy: { displayName: 'asc' },
    });
    return students.map((student) => this.mapStudentSummary(student));
  }

  private mapStudentSummary(student: {
    id: string;
    email: string;
    displayName: string;
    status: string;
    proficiencyLevel: StudentSummaryBackendDto['proficiencyLevel'];
    timezone: string;
    teacherId: string | null;
    teacher: { displayName: string } | null;
    avatarUrl: string | null;
    nativeLanguageId: string | null;
    learningLanguages: Array<{ languageId: string }>;
    scheduleType: boolean;
    lessonFormat: 'INDIVIDUAL_ONLY' | 'GROUP_ONLY' | 'MIXED';
    displayColor: string | null;
    createdAt: Date;
  }): StudentSummaryBackendDto {
    return {
      id: student.id,
      email: student.email,
      displayName: student.displayName,
      status: student.status.toLowerCase() as StudentSummaryBackendDto['status'],
      proficiencyLevel: student.proficiencyLevel ?? null,
      timezone: student.timezone,
      teacherId: student.teacherId,
      teacherName: student.teacher?.displayName ?? null,
      avatarUrl: student.avatarUrl,
      nativeLanguageId: student.nativeLanguageId,
      learningLanguageIds: student.learningLanguages.map((l) => l.languageId),
      scheduleType: student.scheduleType,
      lessonFormat:
        student.lessonFormat === 'INDIVIDUAL_ONLY'
          ? 'individual_only'
          : student.lessonFormat === 'GROUP_ONLY'
            ? 'group_only'
            : 'mixed',
      displayColor: student.displayColor,
      createdAt: student.createdAt.toISOString(),
    };
  }

  private studentsWhere(actor: { id: string; role: string }): Prisma.UserWhereInput {
    return {
      AND: [
        actor.role === 'TEACHER'
          ? { role: 'STUDENT' as const, teacherId: actor.id }
          : { role: 'STUDENT' as const },
        this.tenantStudentFilter(),
      ],
    };
  }

  async listStudentsPage(
    actorUserId: string,
    limit = 25,
    cursor?: string,
  ): Promise<{
    items: StudentSummaryBackendDto[];
    hasMore: boolean;
    nextCursor: string | null;
  }> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role === 'STUDENT') {
      throw new ForbiddenException('Students section is available only for staff roles');
    }
    const take = Math.min(Math.max(limit, 1), 100);
    const cursorParts = cursor?.split('|');
    const cursorWhere =
      cursorParts?.length === 2 && cursorParts[0] && cursorParts[1]
        ? {
            OR: [
              { displayName: { gt: cursorParts[0] } },
              {
                AND: [{ displayName: cursorParts[0] }, { id: { gt: cursorParts[1] } }],
              },
            ],
          }
        : {};
    const students = await this.prisma.user.findMany({
      where: { AND: [this.studentsWhere(actor), cursorWhere] },
      include: {
        teacher: { select: { id: true, displayName: true } },
        learningLanguages: { select: { languageId: true } },
      },
      orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
      take: take + 1,
    });
    const hasMore = students.length > take;
    const page = hasMore ? students.slice(0, take) : students;
    const items = page.map((student) => this.mapStudentSummary(student));
    const last = page[page.length - 1];
    const nextCursor = hasMore && last ? `${last.displayName}|${last.id}` : null;
    return { items, hasMore, nextCursor };
  }

  async listAssignableTeachers(actorUserId: string): Promise<AssignableTeacherDto[]> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role === 'STUDENT') {
      throw new ForbiddenException('Assignable teachers are available only for staff roles');
    }
    const teachers = await this.prisma.user.findMany({
      where: { AND: [{ role: { in: [...TEACHING_ROLES] } }, this.tenantStudentFilter()] },
      select: { id: true, email: true, displayName: true, role: true, timezone: true },
      orderBy: { displayName: 'asc' },
    });
    return teachers.map((row) => ({
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      role: row.role.toLowerCase() as AssignableTeacherDto['role'],
      timezone: row.timezone,
    }));
  }

  async getMyProfile(userId: string): Promise<MyProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: { select: { provider: true, providerEmail: true } },
        calendarConnection: { select: { refreshToken: true } },
        zoomConnection: { select: { refreshToken: true, email: true } },
      },
    });
    if (!user) throw new UnauthorizedException();
    return this.mapProfile(user);
  }

  async updateMyProfile(userId: string, body: UpdateMyProfileRequestDto): Promise<MyProfileDto> {
    if ((body as { learningLanguageIds?: unknown }).learningLanguageIds !== undefined) {
      throw new ForbiddenException('Learning languages can only be changed by an admin');
    }
    const data: Prisma.UserUncheckedUpdateInput = {};
    if (body.displayName !== undefined) data.displayName = body.displayName.trim();
    if (body.timezone !== undefined) data.timezone = body.timezone;
    if (body.locale !== undefined) {
      if (body.locale !== null && !normalizeLocale(body.locale)) {
        throw new BadRequestException(`Unsupported locale: ${body.locale}`);
      }
      data.locale = body.locale === null ? null : normalizeLocale(body.locale);
    }
    if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
    if (body.proficiencyLevel !== undefined) data.proficiencyLevel = body.proficiencyLevel;
    if (body.phone !== undefined) {
      data.phone = body.phone === null ? null : this.normalizePhone(body.phone);
    }
    if (body.telegram !== undefined) {
      data.telegram = body.telegram === null ? null : this.normalizeTelegram(body.telegram);
    }
    if (body.bio !== undefined) {
      data.bio = body.bio === null ? null : body.bio.trim() || null;
    }
    if (body.nativeLanguageId !== undefined) {
      if (body.nativeLanguageId !== null) {
        await this.languages.assertLanguageIds([body.nativeLanguageId]);
      }
      data.nativeLanguageId = body.nativeLanguageId;
    }
    if (body.notificationPrefs) {
      const prefs = body.notificationPrefs;
      if (prefs.lessonReminder !== undefined) data.notifyLessonReminder = prefs.lessonReminder;
      if (prefs.streakAlert !== undefined) data.notifyStreakAlert = prefs.streakAlert;
      if (prefs.weeklyReport !== undefined) data.notifyWeeklyReport = prefs.weeklyReport;
      if (prefs.newVocab !== undefined) data.notifyNewVocab = prefs.newVocab;
      if (prefs.teacherMessages !== undefined) data.notifyTeacherMessages = prefs.teacherMessages;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        oauthAccounts: { select: { provider: true, providerEmail: true } },
        calendarConnection: { select: { refreshToken: true } },
        zoomConnection: { select: { refreshToken: true, email: true } },
      },
    });
    return this.mapProfile(updated);
  }

  async getStaffUserProfile(actorUserId: string, targetUserId: string): Promise<MyProfileDto> {
    await this.assertStaffProfileAccess(actorUserId, targetUserId);
    return this.getMyProfile(targetUserId);
  }

  async updateStaffUserProfile(
    actorUserId: string,
    body: UpdateStaffUserProfileRequestDto,
  ): Promise<MyProfileDto> {
    await this.assertStaffProfileAccess(actorUserId, body.userId);
    const data: Prisma.UserUncheckedUpdateInput = {};
    if (body.displayName !== undefined) data.displayName = body.displayName.trim();
    if (body.timezone !== undefined) data.timezone = body.timezone;
    if (body.phone !== undefined) {
      data.phone = body.phone === null ? null : this.normalizePhone(body.phone);
    }
    if (body.telegram !== undefined) {
      data.telegram = body.telegram === null ? null : this.normalizeTelegram(body.telegram);
    }
    if (body.bio !== undefined) {
      data.bio = body.bio === null ? null : body.bio.trim() || null;
    }
    if (body.status !== undefined) {
      data.status = body.status.toUpperCase() as UserProfileRow['status'];
    }

    const updated = await this.prisma.user.update({
      where: { id: body.userId },
      data,
      include: {
        oauthAccounts: { select: { provider: true, providerEmail: true } },
        calendarConnection: { select: { refreshToken: true } },
        zoomConnection: { select: { refreshToken: true, email: true } },
      },
    });
    return this.mapProfile(updated);
  }

  private async assertStaffProfileAccess(actorUserId: string, targetUserId: string) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can manage staff profiles');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });
    if (!target) throw new BadRequestException('Staff member not found');
    if (!TEACHING_ROLES.includes(target.role as (typeof TEACHING_ROLES)[number])) {
      throw new BadRequestException('User is not staff');
    }
    if (target.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can manage super-admin profiles');
    }
    return target;
  }

  async changeMyPassword(userId: string, body: ChangePasswordRequestDto): Promise<{ ok: true }> {
    if (!body?.newPassword || body.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (!user.passwordHash) {
      throw new BadRequestException(
        'Password is managed by your linked identity provider (e.g. Google). Use it to sign in.',
      );
    }
    const matches = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!matches) throw new BadRequestException('Current password is incorrect');
    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true };
  }

  private normalizePhone(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length < 7 || digits.length > 15) {
      throw new BadRequestException('Phone number must contain 7–15 digits');
    }
    return `+${digits}`;
  }

  private normalizeTelegram(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    if (!/^@[a-zA-Z0-9_]{5,32}$/.test(handle)) {
      throw new BadRequestException('Telegram username must be 5–32 characters (letters, numbers, underscore)');
    }
    return handle;
  }

  private mapNotificationPrefs(user: UserProfileRow): ProfileNotificationPrefs {
    return {
      lessonReminder: user.notifyLessonReminder,
      streakAlert: user.notifyStreakAlert,
      weeklyReport: user.notifyWeeklyReport,
      newVocab: user.notifyNewVocab,
      teacherMessages: user.notifyTeacherMessages,
    };
  }

  private mapLinkedAccounts(user: {
    oauthAccounts: Array<{ provider: 'GOOGLE' | 'FACEBOOK' | 'TELEGRAM'; providerEmail: string | null }>;
    calendarConnection: { refreshToken: string | null } | null;
    zoomConnection?: { refreshToken: string | null; email: string | null } | null;
  }): ProfileLinkedAccountDto[] {
    const google = user.oauthAccounts.find((row) => row.provider === 'GOOGLE');
    const facebook = user.oauthAccounts.find((row) => row.provider === 'FACEBOOK');
    const telegram = user.oauthAccounts.find((row) => row.provider === 'TELEGRAM');
    const calendarConnected = Boolean(user.calendarConnection?.refreshToken);
    const zoomLinked = Boolean(user.zoomConnection?.refreshToken);
    return [
      {
        provider: 'google',
        linked: Boolean(google),
        connectedAs: google?.providerEmail ?? null,
        calendarConnected,
      },
      {
        provider: 'facebook',
        linked: Boolean(facebook),
        connectedAs: facebook?.providerEmail ?? null,
      },
      {
        provider: 'telegram',
        linked: Boolean(telegram),
        connectedAs: telegram?.providerEmail ?? null,
      },
      {
        provider: 'zoom',
        linked: zoomLinked,
        connectedAs: user.zoomConnection?.email ?? null,
      },
    ];
  }

  private mapProfile(
    user: UserProfileRow & {
      oauthAccounts?: Array<{ provider: 'GOOGLE' | 'FACEBOOK' | 'TELEGRAM'; providerEmail: string | null }>;
      calendarConnection?: { refreshToken: string | null } | null;
      zoomConnection?: { refreshToken: string | null; email: string | null } | null;
    },
  ): MyProfileDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      locale: user.locale ?? null,
      proficiencyLevel: user.proficiencyLevel ?? null,
      phone: user.phone,
      telegram: user.telegram,
      bio: user.bio,
      nativeLanguageId: user.nativeLanguageId,
      role: user.role.toLowerCase() as MyProfileDto['role'],
      status: user.status.toLowerCase() as MyProfileDto['status'],
      notificationPrefs: this.mapNotificationPrefs(user),
      linkedAccounts: this.mapLinkedAccounts({
        oauthAccounts: user.oauthAccounts ?? [],
        calendarConnection: user.calendarConnection ?? null,
        zoomConnection: user.zoomConnection ?? null,
      }),
    };
  }
}
