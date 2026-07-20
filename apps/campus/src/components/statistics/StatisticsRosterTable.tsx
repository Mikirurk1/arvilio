'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import type { StatisticsDashboardViewModel } from '../../lib/map-statistics-dashboard';
import { formatMoneyMinor } from '../../lib/format-money';
import { DashboardSection } from './DashboardSection';
import { SECTION_INFO } from './statistics-chart-config';
import styles from './StatisticsDashboard.module.scss';

interface Props {
  roster: StatisticsDashboardViewModel['roster'];
  studentScope: string;
  showAdminBillingRoster: boolean;
  showTeacherLessonsRoster: boolean;
  isProfile: boolean;
  chartCardClass: string;
  renderSectionInfo: (id: string) => ReactNode;
}

export function StatisticsRosterTable({
  roster,
  studentScope,
  showAdminBillingRoster,
  showTeacherLessonsRoster,
  isProfile,
  chartCardClass,
  renderSectionInfo,
}: Props) {
  return (
    <DashboardSection
      profile={isProfile}
      icon={<Users size={16} />}
      title={studentScope === 'my_students' ? 'My students' : 'All students'}
      description={SECTION_INFO.roster}
      aside={renderSectionInfo('roster')}
      className={`${chartCardClass} ${styles.rosterCard}`}
      fullWidth
    >
      <div className={styles.rosterWrap}>
        {(roster ?? []).length > 0 ? (
          <table className={styles.rosterTable}>
            <thead>
              {showAdminBillingRoster ? (
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Type</th>
                  <th scope="col">Price/lesson</th>
                  <th scope="col">Done</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Cancel</th>
                  <th scope="col">Credited</th>
                  <th scope="col">Paid</th>
                  <th scope="col">Lessons +</th>
                  <th scope="col">Billable</th>
                </tr>
              ) : showTeacherLessonsRoster ? (
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Type</th>
                  <th scope="col">Done</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Cancel</th>
                  <th scope="col">Credited</th>
                  <th scope="col">Hours</th>
                </tr>
              ) : (
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Type</th>
                  <th scope="col">Done</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Cancel</th>
                  <th scope="col">Hours</th>
                  <th scope="col">Practice</th>
                  <th scope="col">Words+</th>
                  <th scope="col">Learned</th>
                  <th scope="col">Quiz</th>
                  <th scope="col">Speak</th>
                  <th scope="col">HW✓</th>
                  <th scope="col">Streak</th>
                </tr>
              )}
            </thead>
            <tbody>
              {(roster ?? []).map((row) =>
                showAdminBillingRoster ? (
                  <tr key={row.studentId}>
                    <td>
                      <Link href={`/students/${row.studentId}`} className={styles.rosterLink}>
                        {row.displayName}
                      </Link>
                    </td>
                    <td>{row.lessonTypeLabel ?? '—'}</td>
                    <td>
                      {row.pricePerLessonMinor != null && row.currency
                        ? formatMoneyMinor(row.pricePerLessonMinor, row.currency)
                        : '—'}
                    </td>
                    <td>{row.completedLessons}</td>
                    <td>{row.plannedLessons}</td>
                    <td>{row.cancelledLessons}</td>
                    <td>{row.cancelledCredited}</td>
                    <td>
                      {row.paidInPeriodMinor != null && row.currency
                        ? formatMoneyMinor(row.paidInPeriodMinor, row.currency)
                        : '—'}
                    </td>
                    <td>{row.lessonsGrantedInPeriod ?? 0}</td>
                    <td>
                      {row.billableMinor != null && row.currency
                        ? formatMoneyMinor(row.billableMinor, row.currency)
                        : '—'}
                    </td>
                  </tr>
                ) : showTeacherLessonsRoster ? (
                  <tr key={row.studentId}>
                    <td>
                      <Link href={`/students/${row.studentId}`} className={styles.rosterLink}>
                        {row.displayName}
                      </Link>
                    </td>
                    <td>{row.lessonTypeLabel ?? '—'}</td>
                    <td>{row.completedLessons}</td>
                    <td>{row.plannedLessons}</td>
                    <td>{row.cancelledLessons}</td>
                    <td>{row.cancelledCredited}</td>
                    <td>{row.lessonHours}</td>
                  </tr>
                ) : (
                  <tr key={row.studentId}>
                    <td>
                      <Link href={`/students/${row.studentId}`} className={styles.rosterLink}>
                        {row.displayName}
                      </Link>
                    </td>
                    <td>{row.lessonTypeLabel ?? '—'}</td>
                    <td>{row.completedLessons}</td>
                    <td>{row.plannedLessons}</td>
                    <td>{row.cancelledLessons}</td>
                    <td>{row.lessonHours}</td>
                    <td>{row.practiceMinutes}</td>
                    <td>{row.wordsAdded}</td>
                    <td>{row.wordsLearned}</td>
                    <td>{row.quizAttempts}</td>
                    <td>{row.speakingSubmissions}</td>
                    <td>{row.homeworkReviewed}</td>
                    <td>{row.streakDays}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyChart}>No students in this scope.</div>
        )}
      </div>
    </DashboardSection>
  );
}
