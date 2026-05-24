import {
  directKeyFor,
  initials,
  roleLabel,
  toChatUserDto,
  toDisplayRole,
} from './chat-user.util';

describe('chat-user.util', () => {
  it('toDisplayRole maps roles', () => {
    expect(toDisplayRole('TEACHER', 'v1', 'u1')).toBe('teacher');
    expect(toDisplayRole('STUDENT', 'v1', 'u1')).toBe('student');
    expect(toDisplayRole('ADMIN', 'v1', 'u1')).toBe('admin');
  });

  it('initials from display name', () => {
    expect(initials('Jane Doe')).toBe('JD');
    expect(initials('Solo')).toBe('SO');
    expect(initials('  ')).toBe('?');
  });

  it('roleLabel returns label', () => {
    expect(roleLabel('teacher')).toBe('Teacher');
  });

  it('directKeyFor is order-independent', () => {
    expect(directKeyFor('a', 'b')).toBe(directKeyFor('b', 'a'));
  });

  it('toChatUserDto maps viewer-aware fields', () => {
    const dto = toChatUserDto('viewer', {
      id: 'u1',
      displayName: 'Jane Doe',
      avatarUrl: null,
      role: 'TEACHER',
    });
    expect(dto.displayRole).toBe('teacher');
    expect(dto.initials).toBe('JD');
    expect(dto.roleLabel).toBe('Teacher');
  });
});
