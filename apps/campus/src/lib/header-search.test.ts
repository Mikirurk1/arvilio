import { buildHeaderSearchResults } from './header-search';

describe('buildHeaderSearchResults', () => {
  it('returns empty for blank query', () => {
    expect(
      buildHeaderSearchResults({
        query: '  ',
        lessons: [],
        nameByNumericId: new Map(),
        students: [],
        vocabularyCards: [],
        includeStudents: true,
      }),
    ).toEqual([]);
  });

  it('finds student by display name', () => {
    const results = buildHeaderSearchResults({
      query: 'anna',
      lessons: [],
      nameByNumericId: new Map(),
      students: [
        {
          id: 's1',
          displayName: 'Anna Smith',
          email: 'anna@test',
        } as never,
      ],
      vocabularyCards: [],
      includeStudents: true,
    });
    expect(results.some((r) => r.type === 'student' && r.label.includes('Anna'))).toBe(true);
  });

  it('finds lesson by title and respects limit', () => {
    const backendLesson = {
      id: 'lesson-uuid',
      title: 'Speaking practice',
      date: '2026-06-01',
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      timezone: 'UTC',
      teacherId: 't1',
      teacherName: 'Teacher',
      studentId: 's1',
      studentName: 'Student',
      status: 'planned',
      materials: [],
      homework: { text: '', files: [], fileLinks: [] },
      studentResponse: { status: 'none', text: '', files: [], fileLinks: [] },
    };
    const results = buildHeaderSearchResults({
      query: 'speaking',
      lessons: [backendLesson as never],
      nameByNumericId: new Map(),
      students: [],
      vocabularyCards: [],
      includeStudents: false,
      limit: 5,
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.type).toBe('lesson');
  });

  it('finds vocabulary card by word text', () => {
    const results = buildHeaderSearchResults({
      query: 'apple',
      lessons: [],
      nameByNumericId: new Map(),
      students: [],
      vocabularyCards: [
        {
          id: 'c1',
          word: { id: 'w1', text: 'apple', lemmaText: 'apple', definition: 'fruit' },
        } as never,
      ],
      includeStudents: false,
    });
    expect(results[0]?.type).toBe('vocabulary');
    expect(results[0]?.href).toContain('apple');
  });
});
