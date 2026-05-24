import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  assertStaffCanManageStudentVocabulary,
  assertStaffRole,
} from './vocabulary-staff-access.util';

describe('vocabulary-staff-access.util', () => {
  it('assertStaffRole rejects students', () => {
    expect(() => assertStaffRole('STUDENT')).toThrow(ForbiddenException);
    expect(() => assertStaffRole(undefined)).toThrow(ForbiddenException);
    expect(() => assertStaffRole('TEACHER')).not.toThrow();
  });

  it('assertStaffCanManageStudentVocabulary allows admin and assigned teacher', () => {
    const student = { role: 'STUDENT', teacherId: 'teacher-1' };
    expect(() => assertStaffCanManageStudentVocabulary('ADMIN', student, 'admin-1')).not.toThrow();
    expect(() =>
      assertStaffCanManageStudentVocabulary('TEACHER', student, 'teacher-1'),
    ).not.toThrow();
  });

  it('assertStaffCanManageStudentVocabulary forbids unrelated teacher', () => {
    expect(() =>
      assertStaffCanManageStudentVocabulary(
        'TEACHER',
        { role: 'STUDENT', teacherId: 'other' },
        'teacher-1',
      ),
    ).toThrow(ForbiddenException);
  });

  it('assertStaffCanManageStudentVocabulary requires student row', () => {
    expect(() => assertStaffCanManageStudentVocabulary('ADMIN', null, 'admin-1')).toThrow(
      NotFoundException,
    );
  });
});
