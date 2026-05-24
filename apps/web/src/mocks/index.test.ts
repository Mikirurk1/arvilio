import {
  USER_ROLE,
  canEdit,
  canManage,
  canView,
  formatTimeZoneOptionLabel,
  getProficiencyLevelById,
  getTimeZoneById,
} from './index';

describe('mocks/index re-exports', () => {
  it('re-exports role helpers from roles', () => {
    expect(canView('dashboard', USER_ROLE.student.id)).toBe(true);
    expect(canEdit('dashboard', USER_ROLE.student.id)).toBe(false);
    expect(canManage('dashboard', USER_ROLE.admin.id)).toBe(true);
  });

  it('re-exports catalog helpers from @pkg/types', () => {
    expect(getTimeZoneById(1)).toBeDefined();
    expect(getProficiencyLevelById(1)).toBeDefined();
    expect(formatTimeZoneOptionLabel(getTimeZoneById(1)!)).toContain('Kyiv');
  });
});
