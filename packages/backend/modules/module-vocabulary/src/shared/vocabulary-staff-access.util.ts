import { ForbiddenException, NotFoundException } from '@nestjs/common';

export function assertStaffRole(role: string | undefined): void {
  if (!role || role === 'STUDENT') {
    throw new ForbiddenException('This action requires teacher, admin, or super admin role');
  }
}

export function assertStaffCanManageStudentVocabulary(
  viewerRole: string | undefined,
  student: { role: string; teacherId: string | null } | null | undefined,
  actorUserId: string,
): void {
  if (!student) {
    throw new NotFoundException('Student not found');
  }
  if (student.role !== 'STUDENT') {
    throw new NotFoundException('Student not found');
  }
  if (viewerRole === 'ADMIN' || viewerRole === 'SUPER_ADMIN') return;
  if (viewerRole === 'TEACHER' && student.teacherId === actorUserId) return;
  throw new ForbiddenException('You can only manage vocabulary for your students');
}
