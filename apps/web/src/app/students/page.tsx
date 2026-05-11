import { EmptyStateCard, PageHeader } from '../../components/ui';
import { StudentSummaryCard } from '../../components/students';
import {
  activeMockUser,
  canView,
  getVisibleProfiles,
  isTeacherAdminOrSuper,
  USER_ROLE,
} from '../../mocks';
import styles from './page.module.scss';

export default function StudentsPage() {
  const allowedRoles = isTeacherAdminOrSuper(activeMockUser.role);
  if (!allowedRoles || !canView('dashboard', activeMockUser.role)) {
    return (
      <div className={`${styles.page} container container--page`}>
        <EmptyStateCard
          title="No permission"
          description="Students section is available only for teacher, admin, and super admin roles."
        />
      </div>
    );
  }

  const students = getVisibleProfiles(activeMockUser.role, activeMockUser.id);

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title="Students"
        subtitle={
          activeMockUser.role === USER_ROLE.teacher.id
            ? 'Only students assigned to you'
            : 'All students and their assigned teachers'
        }
      />

      {students.length === 0 ? (
        <EmptyStateCard
          title="No students in this scope"
          description={
            activeMockUser.role === USER_ROLE.teacher.id
              ? 'No students are currently assigned to you.'
              : 'No students found for current filters and visibility rules.'
          }
        />
      ) : (
        <div className={styles.grid}>
          {students.map((student) => (
            <StudentSummaryCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
