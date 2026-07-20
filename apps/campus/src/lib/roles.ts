/**
 * Public role/permission matrices (pure functions over UserRoleId).
 * Prefer this module over `mocks/`.
 */
export {
  canEdit,
  canManage,
  canReviewHomework,
  canSchedule,
  canView,
  isAdminOrSuper,
  isTeacherAdminOrSuper,
  roleMatrix,
} from './auth/role-matrix';
