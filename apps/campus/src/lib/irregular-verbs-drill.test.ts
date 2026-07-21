import { listIrregularVerbs } from '@pkg/types';
import {
  buildIrregularVerbDrillResult,
  buildIrregularVerbQuestions,
  buildMcqOptions,
  gradeIrregularVerbAnswer,
  pickIrregularFormDistractors,
  resolveQuestionCount,
} from './irregular-verbs-drill';

describe('irregular-verbs-drill', () => {
  it('buildMcqOptions returns four unique options', () => {
    const options = buildMcqOptions('went', ['came', 'saw', 'took', 'went']);
    expect(options).not.toBeNull();
    expect(options).toHaveLength(4);
    expect(new Set(options!.map((o) => o.toLowerCase())).size).toBe(4);
  });

  it('pickIrregularFormDistractors excludes the correct answer', () => {
    const pool = listIrregularVerbs('common');
    const go = pool.find((entry) => entry.base === 'go');
    expect(go).toBeDefined();
    const distractors = pickIrregularFormDistractors(pool, go!, 'pastSimple');
    expect(distractors).toHaveLength(3);
    expect(distractors.map((d) => d.toLowerCase())).not.toContain('went');
  });

  it('buildIrregularVerbQuestions respects tier and avoids duplicate base+form pairs', () => {
    const questions = buildIrregularVerbQuestions({
      tier: 'common',
      formFocus: 'mixed',
      questionCount: 10,
    });
    expect(questions.length).toBe(10);
    const keys = questions.map((q) => `${q.base}:${q.formType}`);
    expect(new Set(keys).size).toBe(keys.length);
    questions.forEach((question) => {
      expect(question.options).toHaveLength(4);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(4);
    });
  });

  it('resolveQuestionCount caps to pool for extended tier', () => {
    const poolSize = listIrregularVerbs('extended').length * 2;
    expect(resolveQuestionCount('extended', 30, poolSize)).toBe(30);
    expect(resolveQuestionCount('common', 'all', 120)).toBe(120);
  });

  it('gradeIrregularVerbAnswer and result summary', () => {
    const [question] = buildIrregularVerbQuestions({
      tier: 'common',
      formFocus: 'pastSimple',
      questionCount: 10,
    });
    expect(question).toBeDefined();
    expect(gradeIrregularVerbAnswer(question!, question!.correctIndex)).toBe(true);
    expect(gradeIrregularVerbAnswer(question!, (question!.correctIndex + 1) % 4)).toBe(false);

    const result = buildIrregularVerbDrillResult([question!], {
      [question!.id]: question!.correctIndex,
    });
    expect(result.correctCount).toBe(1);
    expect(result.score).toBe(100);
  });
});
