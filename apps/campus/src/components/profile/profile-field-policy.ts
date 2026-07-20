import { USER_ROLE, isAdminOrSuper, type UserRole } from '../../mocks';
import type { FieldMode, ProfileFieldId, ProfileFormContext } from './unified-profile-types';

function isStudentViewer(ctx: ProfileFormContext): boolean {
  return ctx.viewerRole === USER_ROLE.student.id;
}

function isTeacherViewer(ctx: ProfileFormContext): boolean {
  return ctx.viewerRole === USER_ROLE.teacher.id;
}

function canAssignTeacher(ctx: ProfileFormContext): boolean {
  return isAdminOrSuper(ctx.viewerRole);
}

function canManageUserColor(ctx: ProfileFormContext): boolean {
  return (
    ctx.subjectKind === 'student' &&
    !isStudentViewer(ctx) &&
    (isTeacherViewer(ctx) || canAssignTeacher(ctx))
  );
}

function editIfAllowed(ctx: ProfileFormContext): FieldMode {
  return ctx.canEdit ? 'edit' : 'view';
}

export function resolveFieldMode(field: ProfileFieldId, ctx: ProfileFormContext): FieldMode {
  switch (field) {
    case 'displayName':
      return editIfAllowed(ctx);

    case 'email':
      if (ctx.subjectKind === 'staff') return 'view';
      return editIfAllowed(ctx);

    case 'phone':
      if (ctx.subjectKind === 'student' && isTeacherViewer(ctx)) return 'hidden';
      return editIfAllowed(ctx);

    case 'telegram':
      if (ctx.subjectKind === 'student' && isTeacherViewer(ctx)) return 'hidden';
      return editIfAllowed(ctx);

    case 'timezone':
      return editIfAllowed(ctx);

    case 'nativeLanguage':
      if (ctx.subjectKind === 'staff') return 'hidden';
      if (ctx.subjectKind === 'student' && !ctx.showNativeLanguage) return 'hidden';
      return editIfAllowed(ctx);

    case 'proficiency':
      if (ctx.subjectKind === 'staff') return 'hidden';
      if (ctx.subjectKind === 'student' && isStudentViewer(ctx)) return 'hidden';
      if (ctx.subjectKind === 'self' && isStudentViewer(ctx)) return 'view';
      return editIfAllowed(ctx);

    case 'bio':
      if (ctx.subjectKind === 'student' && isStudentViewer(ctx)) return 'hidden';
      return editIfAllowed(ctx);

    case 'studentStatus':
      if (ctx.subjectKind !== 'student') return 'hidden';
      if (isStudentViewer(ctx)) return 'hidden';
      return editIfAllowed(ctx);

    case 'staffStatus':
      if (ctx.subjectKind !== 'staff') return 'hidden';
      return editIfAllowed(ctx);

    case 'scheduleType':
      if (ctx.subjectKind !== 'student') return 'hidden';
      if (isStudentViewer(ctx)) return 'hidden';
      return editIfAllowed(ctx);

    case 'lessonFormat':
      if (ctx.subjectKind !== 'student') return 'hidden';
      if (!ctx.groupLessonsEnabled) return 'hidden';
      if (isStudentViewer(ctx)) return 'hidden';
      if (!canAssignTeacher(ctx) || !ctx.canEdit) return 'view';
      return 'edit';

    case 'assignedTeacher':
      if (ctx.subjectKind !== 'student') return 'hidden';
      if (!canAssignTeacher(ctx)) return 'hidden';
      return editIfAllowed(ctx);

    case 'userColor':
      if (!canManageUserColor(ctx)) return 'hidden';
      return editIfAllowed(ctx);

    default:
      return 'hidden';
  }
}

export function isFieldVisible(field: ProfileFieldId, ctx: ProfileFormContext): boolean {
  return resolveFieldMode(field, ctx) !== 'hidden';
}

export function isFieldEditable(
  field: ProfileFieldId,
  ctx: ProfileFormContext,
  disabled = false,
): boolean {
  return resolveFieldMode(field, ctx) === 'edit' && ctx.canEdit && !disabled;
}

export function sectionHasVisibleFields(
  fields: ProfileFieldId[],
  ctx: ProfileFormContext,
): boolean {
  return fields.some((field) => isFieldVisible(field, ctx));
}

export function subjectRoleLabel(role: UserRole | undefined): string {
  if (!role) return 'User';
  if (role === USER_ROLE.student.id) return 'Student';
  if (role === USER_ROLE.teacher.id) return 'Teacher';
  if (role === USER_ROLE.admin.id) return 'Admin';
  if (role === USER_ROLE.superAdmin.id) return 'Super admin';
  return 'User';
}
