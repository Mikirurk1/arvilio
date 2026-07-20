'use client';

import { SurfaceCard } from '../../../components/ui';
import { UnifiedProfilePanel } from '../../../components/profile/UnifiedProfilePanel';
import {
  studentToUnified,
  unifiedToStudent,
} from '../../../components/profile/profile-form-adapters';
import type { ProfileFormContext } from '../../../components/profile/unified-profile-types';
import type { UserRoleId } from '@pkg/types';
import type { MockStudent } from '../../../lib/user-models';
import { useCampusT } from '../../../lib/cms';
import styles from './page.module.scss';

export function StudentProfileTab({
  student,
  onChange,
  canEdit,
  viewerRole,
  teacherBackendId,
  teacherOptions,
  onTeacherBackendIdChange,
  saved = false,
  saveError = null,
  onSave,
  showNativeLanguage = false,
  nativeLanguageId = '',
  onNativeLanguageIdChange,
}: {
  student: MockStudent;
  onChange: (next: MockStudent) => void;
  canEdit: boolean;
  viewerRole: UserRoleId;
  teacherBackendId: string | null;
  teacherOptions: Array<{ id: string; displayName: string }>;
  onTeacherBackendIdChange: (teacherId: string | null) => void;
  saved?: boolean;
  saveError?: string | null;
  onSave: () => void;
  showNativeLanguage?: boolean;
  nativeLanguageId?: string;
  onNativeLanguageIdChange?: (languageId: string) => void;
}) {
  const t = useCampusT();
  const values = studentToUnified(student, nativeLanguageId, teacherBackendId);

  const context: ProfileFormContext = {
    subjectKind: 'student',
    viewerRole,
    canEdit,
    showNativeLanguage,
  };

  return (
    <SurfaceCard className={styles.tabCard}>
      <UnifiedProfilePanel
        values={values}
        onChange={(patch) => {
          const next = { ...values, ...patch };
          onChange(unifiedToStudent(student, next));
          if (patch.nativeLanguageId !== undefined && onNativeLanguageIdChange) {
            onNativeLanguageIdChange(patch.nativeLanguageId);
          }
          if (patch.assignedTeacherId !== undefined) {
            onTeacherBackendIdChange(patch.assignedTeacherId);
          }
        }}
        context={context}
        saved={saved}
        saveError={saveError}
        onSave={onSave}
        saveLabel={t('students.detail.saveStudent')}
        idPrefix="student-profile"
        teacherOptions={teacherOptions}
      />
    </SurfaceCard>
  );
}
