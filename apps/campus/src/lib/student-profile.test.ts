import type { AuthUserDto, StudentSummaryBackendDto } from '@pkg/types';
import { USER_ROLE } from '@pkg/types';
import {
  canManageBackendStudent,
  mapBackendStudentToProfile,
  resolveStudentProfile,
  studentIdToNumericId,
} from './student-profile';

const backendRow = (
  overrides: Partial<StudentSummaryBackendDto> = {},
): StudentSummaryBackendDto =>
  ({
    id: 'student-uuid-1',
    displayName: 'Jane Student',
    email: 'jane@test.com',
    status: 'active',
    proficiencyLevel: 'B1',
    teacherId: 'teacher-uuid-1',
    teacherName: 'Mr Teacher',
    displayColor: '#336699',
    scheduleType: true,
    avatarUrl: null,
    ...overrides,
  }) as StudentSummaryBackendDto;

describe('student-profile', () => {
  it('studentIdToNumericId is stable and non-zero', () => {
    const a = studentIdToNumericId('student-uuid-1');
    const b = studentIdToNumericId('student-uuid-1');
    expect(a).toBe(b);
    expect(a).toBeGreaterThan(0);
  });

  it('mapBackendStudentToProfile maps proficiency and status', () => {
    const profile = mapBackendStudentToProfile(
      backendRow({ proficiencyLevel: 'C2', status: 'paused' }),
    );
    expect(profile.fullName).toBe('Jane Student');
    expect(profile.proficiencyLevelId).toBe(6);
    expect(profile.statusId).toBe(2);
    expect(profile.teacherName).toBe('Mr Teacher');
  });

  it('resolveStudentProfile finds row by backend id', () => {
    const row = backendRow();
    const resolved = resolveStudentProfile('student-uuid-1', [row]);
    expect(resolved?.backendId).toBe('student-uuid-1');
    expect(resolved?.profile.fullName).toBe('Jane Student');
  });

  it('canManageBackendStudent allows admin and assigned teacher', () => {
    const authTeacher = { id: 'teacher-uuid-1' } as AuthUserDto;
    const row = backendRow({ teacherId: 'teacher-uuid-1' });

    expect(canManageBackendStudent(USER_ROLE.admin.id, null, row, mapBackendStudentToProfile(row))).toBe(
      true,
    );
    expect(
      canManageBackendStudent(USER_ROLE.teacher.id, authTeacher, row, mapBackendStudentToProfile(row)),
    ).toBe(true);
    expect(
      canManageBackendStudent(
        USER_ROLE.teacher.id,
        { id: 'other-teacher' } as AuthUserDto,
        row,
        mapBackendStudentToProfile(row),
      ),
    ).toBe(false);
    expect(
      canManageBackendStudent(USER_ROLE.student.id, null, row, mapBackendStudentToProfile(row)),
    ).toBe(false);
  });

  it('resolveStudentProfile returns undefined for empty route id', () => {
    expect(resolveStudentProfile('', [backendRow()])).toBeUndefined();
  });

  it('resolveStudentProfile returns undefined when API has no row', () => {
    expect(resolveStudentProfile('unknown-id', [])).toBeUndefined();
  });

  it('canManageBackendStudent uses mock teacherId when row has no teacherId', () => {
    const profile = mapBackendStudentToProfile(backendRow({ teacherId: null, teacherName: '—' }));
    const withTeacher = { ...profile, teacherId: 42 };
    expect(
      canManageBackendStudent(USER_ROLE.teacher.id, { id: 't1' } as AuthUserDto, null, withTeacher),
    ).toBe(true);
  });

  it('mapBackendStudentToProfile defaults missing proficiency to A1', () => {
    const profile = mapBackendStudentToProfile(backendRow({ proficiencyLevel: undefined }));
    expect(profile.proficiencyLevelId).toBe(1);
  });
});
