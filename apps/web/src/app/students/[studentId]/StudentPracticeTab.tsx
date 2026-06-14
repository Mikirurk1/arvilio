'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Brain, Mic } from 'lucide-react';
import { SegmentedControl, SurfaceCard } from '../../../components/ui';
import { canEdit } from '../../../lib/roles';
import { countIncompleteAssignedQuizzes } from '../../../lib/practice-pending';
import { useActiveUser } from '../../../lib/active-user';
import { useQuizzesStore } from '../../../stores/quizzes-store';
import { useVocabularyStore } from '../../../stores/vocabulary-store';
import { StudentSpeakingTab } from './StudentSpeakingTab';
import { StudentQuizTab } from './StudentQuizTab';
import { StudentVocabularyTab } from './StudentVocabularyTab';
import pageStyles from './page.module.scss';
import styles from './StudentPracticeTab.module.scss';

/** Practice sub-sections on the student profile. */
export type StudentPracticeSection = 'vocabulary' | 'quiz' | 'speaking';

type PracticeSectionConfig = {
  value: StudentPracticeSection;
  label: string;
  Icon: typeof BookOpen;
};

export const STUDENT_PRACTICE_SECTIONS: PracticeSectionConfig[] = [
  { value: 'vocabulary', label: 'Vocabulary', Icon: BookOpen },
  { value: 'quiz', label: 'Quiz', Icon: Brain },
  { value: 'speaking', label: 'Speaking', Icon: Mic },
];

type Props = {
  studentId: string;
};

export function StudentPracticeTab({ studentId }: Props) {
  const activeUser = useActiveUser();
  const isStaff = canEdit('quiz', activeUser.role);
  const [section, setSection] = useState<StudentPracticeSection>('vocabulary');
  const [visitedSections, setVisitedSections] = useState(
    () => new Set<StudentPracticeSection>(['vocabulary']),
  );

  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const cards = useVocabularyStore((s) => s.cards);
  const fetchStudentQuizzes = useQuizzesStore((s) => s.fetchStudentQuizzes);
  const studentQuizzes = useQuizzesStore((s) => s.studentQuizzes);

  useEffect(() => {
    void fetchCards(studentId);
    void fetchStudentQuizzes(studentId);
  }, [fetchCards, fetchStudentQuizzes, studentId]);

  const vocabBadge = useMemo(() => {
    const count = (cards.data ?? []).filter((card) => card.status === 'mistakes_work').length;
    return count > 0 ? count : null;
  }, [cards.data]);

  const quizBadge = useMemo(() => {
    const count = countIncompleteAssignedQuizzes(studentQuizzes.data);
    return count > 0 ? count : null;
  }, [studentQuizzes.data]);

  const onSectionChange = (next: StudentPracticeSection) => {
    setSection(next);
    setVisitedSections((prev) => {
      const copy = new Set(prev);
      copy.add(next);
      return copy;
    });
  };

  const badges: Record<StudentPracticeSection, number | null> = useMemo(
    () => ({
      vocabulary: vocabBadge,
      quiz: quizBadge,
      speaking: null,
    }),
    [quizBadge, vocabBadge],
  );

  const segmentOptions = useMemo(
    () =>
      STUDENT_PRACTICE_SECTIONS.map((entry) => {
        const badge = badges[entry.value];
        const badgeLabel =
          entry.value === 'vocabulary'
            ? `${badge} in mistakes work`
            : `${badge} incomplete`;
        return {
          value: entry.value,
          label: (
            <span className={styles.segmentLabel}>
              <entry.Icon size={15} aria-hidden />
              {entry.label}
              {badge != null ? (
                <span className={styles.segmentBadge} aria-label={badgeLabel}>
                  {badge}
                </span>
              ) : null}
            </span>
          ),
        };
      }),
    [badges],
  );

  return (
    <SurfaceCard className={`${pageStyles.tabCard} ${styles.practiceTab}`}>
      <h2 className={pageStyles.tabSectionTitle}>Practice</h2>
      <p className={styles.practiceIntro}>
        {isStaff
          ? 'Vocabulary and quizzes for this student — generate assignments, track progress, and preview as staff.'
          : 'Your vocabulary and assigned quizzes in one place.'}
      </p>

      <SegmentedControl
        className={styles.practiceSubNav}
        optionClassName={styles.practiceSegmentOption}
        ariaLabel="Practice areas"
        value={section}
        onValueChange={onSectionChange}
        options={segmentOptions}
      />

      <div className={styles.practicePanel} role="tabpanel">
        {visitedSections.has('vocabulary') ? (
          <div
            className={styles.embeddedSection}
            hidden={section !== 'vocabulary'}
            aria-hidden={section !== 'vocabulary'}
          >
            <StudentVocabularyTab studentId={studentId} embedded />
          </div>
        ) : null}
        {visitedSections.has('quiz') ? (
          <div
            className={styles.embeddedSection}
            hidden={section !== 'quiz'}
            aria-hidden={section !== 'quiz'}
          >
            <StudentQuizTab studentId={studentId} embedded />
          </div>
        ) : null}
        {visitedSections.has('speaking') ? (
          <div
            className={styles.embeddedSection}
            hidden={section !== 'speaking'}
            aria-hidden={section !== 'speaking'}
          >
            <StudentSpeakingTab studentId={studentId} embedded />
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
