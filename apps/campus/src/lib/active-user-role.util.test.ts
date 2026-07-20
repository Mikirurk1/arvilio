import { USER_ROLE } from '@pkg/types';
import {
  isAdminOrSuperKey,
  isSuperAdminKey,
  isTeacherAdminOrSuperKey,
  mapAuthRoleToRoleId,
  mapRoleIdToAuthRole,
} from './active-user-role.util';

describe('active-user-role.util', () => {
  it('mapAuthRoleToRoleId defaults to student', () => {
    expect(mapAuthRoleToRoleId(null)).toBe(USER_ROLE.student.id);
    expect(mapAuthRoleToRoleId('teacher')).toBe(USER_ROLE.teacher.id);
  });

  it('mapRoleIdToAuthRole round-trips known roles', () => {
    expect(mapRoleIdToAuthRole(USER_ROLE.admin.id)).toBe('admin');
    expect(mapRoleIdToAuthRole(USER_ROLE.superAdmin.id)).toBe('super_admin');
  });

  it('role key helpers', () => {
    expect(isTeacherAdminOrSuperKey('teacher')).toBe(true);
    expect(isTeacherAdminOrSuperKey('student')).toBe(false);
    expect(isAdminOrSuperKey('admin')).toBe(true);
    expect(isSuperAdminKey('super_admin')).toBe(true);
  });
});
