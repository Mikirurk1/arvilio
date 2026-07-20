import { getStudentsNavLabel } from './students-nav-label';

describe('getStudentsNavLabel', () => {
  it('returns Students when group lessons are off', () => {
    expect(getStudentsNavLabel(false)).toBe('Students');
  });

  it('returns Students & Groups when group lessons are on', () => {
    expect(getStudentsNavLabel(true)).toBe('Students & Groups');
  });
});
