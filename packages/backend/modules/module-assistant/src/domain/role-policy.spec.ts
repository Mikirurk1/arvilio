import {
  isNavAllowedForRole,
  rolePolicyPrompt,
  academicRefusalForRole,
} from './role-policy';

describe('role-policy', () => {
  it('allows student nav and blocks finance/system', () => {
    expect(isNavAllowedForRole('student', '/calendar')).toBe(true);
    expect(isNavAllowedForRole('student', '/payment')).toBe(true);
    expect(isNavAllowedForRole('student', '/finance')).toBe(false);
    expect(isNavAllowedForRole('student', '/system')).toBe(false);
  });

  it('allows teacher materials/students but not billing', () => {
    expect(isNavAllowedForRole('teacher', '/materials')).toBe(true);
    expect(isNavAllowedForRole('teacher', '/students')).toBe(true);
    expect(isNavAllowedForRole('teacher', '/billing')).toBe(false);
    expect(isNavAllowedForRole('teacher', '/system')).toBe(false);
  });

  it('allows admin operational routes', () => {
    expect(isNavAllowedForRole('admin', '/finance')).toBe(true);
    expect(isNavAllowedForRole('admin', '/system')).toBe(true);
    expect(isNavAllowedForRole('admin', '/billing')).toBe(true);
  });

  it('embeds distinct role policy text', () => {
    expect(rolePolicyPrompt('student')).toMatch(/MUST NOT:.*Finance/i);
    expect(rolePolicyPrompt('teacher')).toMatch(/admin-only/i);
    expect(rolePolicyPrompt('teacher')).toMatch(/UI labels/i);
    expect(rolePolicyPrompt('admin')).toMatch(/API keys/i);
    expect(rolePolicyPrompt('admin')).toMatch(/Materials/i);
  });

  it('varies academic refusal by role', () => {
    expect(academicRefusalForRole('student')).toMatch(/ask your teacher/i);
    expect(academicRefusalForRole('teacher')).toMatch(/student's homework/i);
    expect(academicRefusalForRole('admin')).toMatch(/System, Finance/i);
  });
});
