import type { UserRole } from '@prisma/client';
import type { ChatDisplayRole, ChatUserDto } from '@pkg/types';

const ROLE_LABEL: Record<ChatDisplayRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
};

export function toDisplayRole(role: UserRole, viewerId: string, userId: string): ChatDisplayRole {
  if (role === 'SUPER_ADMIN' && viewerId !== userId) return 'admin';
  if (role === 'SUPER_ADMIN') return 'admin';
  if (role === 'ADMIN') return 'admin';
  if (role === 'TEACHER') return 'teacher';
  return 'student';
}

export function roleLabel(displayRole: ChatDisplayRole): string {
  return ROLE_LABEL[displayRole];
}

export function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function toChatUserDto(
  viewerId: string,
  user: { id: string; displayName: string; avatarUrl: string | null; role: UserRole },
): ChatUserDto {
  const displayRole = toDisplayRole(user.role, viewerId, user.id);
  return {
    id: user.id,
    displayName: user.displayName,
    displayRole,
    roleLabel: roleLabel(displayRole),
    avatarUrl: user.avatarUrl,
    initials: initials(user.displayName),
  };
}

export function directKeyFor(userAId: string, userBId: string): string {
  return [userAId, userBId].sort().join(':');
}
