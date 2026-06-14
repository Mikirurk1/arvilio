import { partyNumericId } from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import { studentSelectOptionValue } from './use-student-select-options';

describe('use-student-select-options helpers', () => {
  it('maps backend ids to party ids for lesson forms', () => {
    const backendId = 'abc123def456789012345678';
    expect(studentSelectOptionValue(backendId, 'backendId')).toBe(backendId);
    expect(studentSelectOptionValue(backendId, 'partyId')).toBe(String(partyNumericId(backendId)));
  });
});
