import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { MailService } from '@be/mail';
import { TenantContextService } from '@be/tenant';
import type { SchoolMembershipRole } from '@prisma/client';

const INVITATION_TTL_DAYS = 7;

export interface CreateInvitationDto {
  email: string;
  role: SchoolMembershipRole;
}

export interface InvitationDto {
  id: string;
  email: string;
  role: SchoolMembershipRole;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly tenant: TenantContextService,
  ) {}

  async create(dto: CreateInvitationDto, createdById: string): Promise<InvitationDto> {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) throw new ForbiddenException('No active school');

    const email = dto.email.toLowerCase().trim();

    // Block if already an active member.
    const existing = await this.prisma.schoolMembership.findFirst({
      where: {
        schoolId,
        user: { email },
        status: 'ACTIVE',
      },
    });
    if (existing) throw new BadRequestException('User is already a member of this school');

    // Revoke any pending (non-accepted, non-revoked, non-expired) invitation.
    await this.prisma.schoolInvitation.updateMany({
      where: {
        schoolId,
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { revokedAt: new Date() },
    });

    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);
    const invitation = await this.prisma.schoolInvitation.create({
      data: { schoolId, email, role: dto.role, expiresAt, createdById },
    });

    const acceptUrl = `${this.mail.appUrl()}/invitations/accept?token=${invitation.token}`;
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true },
    });

    void this.mail
      .sendTemplated(email, 'school-invitation', {
        schoolName: school?.name ?? 'your school',
        role: dto.role.toLowerCase(),
        acceptUrl,
        expiresInDays: String(INVITATION_TTL_DAYS),
      })
      .catch(() => undefined);

    return this.toDto(invitation);
  }

  async list(): Promise<InvitationDto[]> {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) throw new ForbiddenException('No active school');

    const invitations = await this.prisma.schoolInvitation.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
    return invitations.map(this.toDto);
  }

  async revoke(id: string): Promise<void> {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) throw new ForbiddenException('No active school');

    const invitation = await this.prisma.schoolInvitation.findFirst({
      where: { id, schoolId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.revokedAt || invitation.acceptedAt) {
      throw new BadRequestException('Invitation is already used or revoked');
    }

    await this.prisma.schoolInvitation.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Accept an invitation by token. Creates a SchoolMembership (or re-activates
   * an existing one) for the authenticated user and marks the invitation accepted.
   * The user must be authenticated; their email must match the invitation.
   */
  async accept(token: string, userId: string): Promise<void> {
    const invitation = await this.prisma.schoolInvitation.findUnique({
      where: { token },
      include: { school: { select: { status: true, name: true } } },
    });

    if (!invitation || invitation.revokedAt) {
      throw new NotFoundException('Invitation not found or revoked');
    }
    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }
    if (invitation.school.status === 'SUSPENDED') {
      throw new ForbiddenException('This school is suspended');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.email.toLowerCase() !== invitation.email) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    await this.prisma.$transaction([
      // Upsert membership — re-activate if previously left.
      this.prisma.schoolMembership.upsert({
        where: { schoolId_userId: { schoolId: invitation.schoolId, userId } },
        create: { schoolId: invitation.schoolId, userId, role: invitation.role, status: 'ACTIVE' },
        update: { role: invitation.role, status: 'ACTIVE' },
      }),
      this.prisma.schoolInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);
  }

  private toDto(inv: {
    id: string;
    email: string;
    role: SchoolMembershipRole;
    expiresAt: Date;
    acceptedAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
  }): InvitationDto {
    return {
      id: inv.id,
      email: inv.email,
      role: inv.role,
      expiresAt: inv.expiresAt.toISOString(),
      acceptedAt: inv.acceptedAt?.toISOString() ?? null,
      revokedAt: inv.revokedAt?.toISOString() ?? null,
      createdAt: inv.createdAt.toISOString(),
    };
  }
}
