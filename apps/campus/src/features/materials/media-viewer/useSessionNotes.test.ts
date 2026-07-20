import { shouldConfirmLeaveSessionNotes } from './useSessionNotes';

describe('useSessionNotes guard', () => {
  it('requires confirm when notes exist', () => {
    expect(shouldConfirmLeaveSessionNotes(false)).toBe(false);
    expect(shouldConfirmLeaveSessionNotes(true)).toBe(true);
  });
});
