import { USER_ROLE } from '@pkg/types';
import {
  canEdit,
  canManage,
  canReviewHomework,
  canSchedule,
  canView,
  isAdminOrSuper,
  isTeacherAdminOrSuper,
  roleMatrix,
} from './roles';

const student = USER_ROLE.student.id;
const teacher = USER_ROLE.teacher.id;
const admin = USER_ROLE.admin.id;

describe('roles matrix', () => {
  it('all roles can view dashboard', () => {
    expect(canView('dashboard', student)).toBe(true);
    expect(canView('dashboard', teacher)).toBe(true);
    expect(canView('dashboard', admin)).toBe(true);
  });

  it('student cannot edit or manage dashboard', () => {
    expect(canEdit('dashboard', student)).toBe(false);
    expect(canManage('dashboard', student)).toBe(false);
  });

  it('teacher can edit dashboard but not manage', () => {
    expect(canEdit('dashboard', teacher)).toBe(true);
    expect(canManage('dashboard', teacher)).toBe(false);
  });

  it('admin can manage dashboard', () => {
    expect(canManage('dashboard', admin)).toBe(true);
    expect(isAdminOrSuper(admin)).toBe(true);
  });

  it('isTeacherAdminOrSuper excludes student', () => {
    expect(isTeacherAdminOrSuper(student)).toBe(false);
    expect(isTeacherAdminOrSuper(teacher)).toBe(true);
  });

  it('canSchedule allows teachers on calendar', () => {
    expect(canSchedule('calendar', student)).toBe(false);
    expect(canSchedule('calendar', teacher)).toBe(true);
  });

  it('canReviewHomework allows staff only', () => {
    expect(canReviewHomework(student)).toBe(false);
    expect(canReviewHomework(teacher)).toBe(true);
    expect(canReviewHomework(admin)).toBe(true);
  });

  it('student can edit chat but not vocabulary', () => {
    expect(canEdit('chat', student)).toBe(true);
    expect(canEdit('vocabulary', student)).toBe(false);
  });

  it('exports roleMatrix with expected scopes', () => {
    expect(Object.keys(roleMatrix)).toEqual(
      expect.arrayContaining(['dashboard', 'vocabulary', 'quiz', 'chat', 'lessons']),
    );
  });
});
