import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import type { Prisma, UserRole } from '@prisma/client';
import { toChatUserDto } from '../shared/chat-user.util';
import type { ChatUserDto } from '@pkg/types';

const STAFF_ROLES = new Set<UserRole>(['ADMIN', 'SUPER_ADMIN']);

@Injectable()
export class ChatVisibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  /**
   * Contacts must stay within the active school. `User` is a global identity
   * (not row-scoped by schoolId), so restrict via an ACTIVE `SchoolMembership` —
   * otherwise the contact picker would expose (and let you message) every user
   * on the platform.
   */
  private tenantMemberFilter(): Prisma.UserWhereInput {
    const schoolId = this.tenant.schoolId;
    return schoolId ? { schoolMemberships: { some: { schoolId, status: 'ACTIVE' } } } : {};
  }

  async listContacts(actorId: string): Promise<ChatUserDto[]> {
    const actor = await this.requireUser(actorId);
    const ids = await this.allowedContactIds(actor);
    if (ids.size === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, displayName: true, avatarUrl: true, role: true },
      orderBy: { displayName: 'asc' },
    });
    return users.map((user) => toChatUserDto(actorId, user));
  }

  async assertCanMessage(actorId: string, peerUserId: string): Promise<void> {
    if (actorId === peerUserId) {
      throw new ForbiddenException('Cannot start a chat with yourself');
    }
    const allowed = await this.allowedContactIds(await this.requireUser(actorId));
    if (!allowed.has(peerUserId)) {
      throw new ForbiddenException('You cannot message this user');
    }
  }

  async assertParticipant(actorId: string, conversationId: string): Promise<void> {
    const row = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: actorId } },
    });
    if (!row) throw new ForbiddenException('You do not have access to this conversation');
  }

  private async requireUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, teacherId: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async allowedContactIds(actor: {
    id: string;
    role: UserRole;
    teacherId: string | null;
  }): Promise<Set<string>> {
    const ids = new Set<string>();

    const inSchool = this.tenantMemberFilter();

    if (STAFF_ROLES.has(actor.role)) {
      const all = await this.prisma.user.findMany({
        where: { AND: [{ id: { not: actor.id } }, inSchool] },
        select: { id: true },
      });
      for (const row of all) ids.add(row.id);
      return ids;
    }

    if (actor.role === 'TEACHER') {
      const [assigned, lessonStudents, staff] = await Promise.all([
        this.prisma.user.findMany({
          where: { role: 'STUDENT', teacherId: actor.id },
          select: { id: true },
        }),
        this.prisma.scheduledLesson.findMany({
          where: { teacherId: actor.id },
          select: { studentId: true },
          distinct: ['studentId'],
        }),
        this.prisma.user.findMany({
          where: { AND: [{ role: { in: ['ADMIN', 'SUPER_ADMIN'] } }, inSchool] },
          select: { id: true },
        }),
      ]);
      for (const row of assigned) ids.add(row.id);
      for (const row of lessonStudents) ids.add(row.studentId);
      for (const row of staff) ids.add(row.id);
      return ids;
    }

    if (actor.role === 'STUDENT') {
      const lessonTeachers = await this.prisma.scheduledLesson.findMany({
        where: { studentId: actor.id },
        select: { teacherId: true },
        distinct: ['teacherId'],
      });
      if (actor.teacherId) ids.add(actor.teacherId);
      for (const row of lessonTeachers) ids.add(row.teacherId);
      const staff = await this.prisma.user.findMany({
        where: { AND: [{ role: { in: ['ADMIN', 'SUPER_ADMIN'] } }, inSchool] },
        select: { id: true },
      });
      for (const row of staff) ids.add(row.id);
    }

    return ids;
  }
}
