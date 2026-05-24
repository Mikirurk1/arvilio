import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationKind } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type { SendTeacherMessageRequestDto, TeacherMessageDto } from '@pkg/types';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationsMailService } from './notifications-mail.service';
import { telegramTeacherMessage } from '../shared/notification-telegram.format';

const TEACHING_ROLES = new Set(['TEACHER', 'ADMIN', 'SUPER_ADMIN']);

@Injectable()
export class TeacherMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: NotificationDispatchService,
    private readonly mail: NotificationsMailService,
  ) {}

  async send(actorUserId: string, body: SendTeacherMessageRequestDto): Promise<TeacherMessageDto> {
    const trimmed = body.body?.trim();
    if (!trimmed) throw new BadRequestException('Message body is required');

    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, role: true, displayName: true },
    });
    if (!actor) throw new ForbiddenException();
    if (!TEACHING_ROLES.has(actor.role)) {
      throw new ForbiddenException('Only staff can send teacher messages');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: body.studentId },
      select: {
        id: true,
        role: true,
        email: true,
        displayName: true,
        notifyTeacherMessages: true,
        teacherId: true,
      },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    if (actor.role === 'TEACHER' && student.teacherId !== actor.id) {
      throw new ForbiddenException('You can only message your assigned students');
    }

    const message = await this.prisma.teacherMessage.create({
      data: {
        teacherId: actor.id,
        studentId: student.id,
        body: trimmed,
      },
    });

    const dto: TeacherMessageDto = {
      id: message.id,
      teacherId: message.teacherId,
      studentId: message.studentId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    };

    if (student.notifyTeacherMessages) {
      const dedupeKey = `message:${message.id}`;
      const appUrl = this.mail.appUrl();
      await this.dispatch.dispatch({
        userId: student.id,
        email: student.email,
        displayName: student.displayName,
        kind: NotificationKind.TEACHER_MESSAGE,
        dedupeKey,
        enabled: true,
        emailTemplate: 'teacher-message',
        emailVars: {
          displayName: student.displayName,
          teacherName: actor.displayName,
          body: trimmed,
          appUrl,
        },
        telegramHtml: telegramTeacherMessage({
          displayName: student.displayName,
          teacherName: actor.displayName,
          body: trimmed,
          appUrl,
        }),
      });
    }

    return dto;
  }
}
