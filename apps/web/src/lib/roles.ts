/**
 * Public role/permission matrices.
 *
 * These are pure functions over numeric `UserRoleId` values from
 * `@soenglish/shared-types`. They have no dependency on mock entities and
 * are the only piece of the legacy `mocks/` tree we want surviving the
 * mocks→backend migration. Prefer importing from this file over `mocks/`
 * in new code.
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
} from '../mocks/roles';
