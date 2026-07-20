import { useState } from 'react';
import { isAdminOrSuper } from '../../../lib/roles';
import { USER_ROLE } from '@pkg/types';
import type { MockStudent } from '../../../lib/user-models';
import { useStudentsStore } from '../../../stores/students-store';
import type { StudentSummaryBackendDto, UserRoleId } from '@pkg/types';

interface TeacherOption {
  backendId: string | null;
  fullName: string;
}

interface UseStudentProfileSaveOptions {
  studentForm: MockStudent;
  setStudentForm: React.Dispatch<React.SetStateAction<MockStudent>>;
  resolvedBackendId: string | null | undefined;
  resolvedTeacherBackendId: string | null | undefined;
  teacherBackendId: string | null;
  nativeLanguageId: string;
  backendRow: Pick<StudentSummaryBackendDto, 'learningLanguageIds'> | null | undefined;
  activeUserRole: UserRoleId;
  teacherOptions: TeacherOption[];
}

export function useStudentProfileSave({
  studentForm,
  setStudentForm,
  resolvedBackendId,
  resolvedTeacherBackendId,
  teacherBackendId,
  nativeLanguageId,
  backendRow,
  activeUserRole,
  teacherOptions,
}: UseStudentProfileSaveOptions) {
  const [savedProfile, setSavedProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const updateStudentAdmin = useStudentsStore((s) => s.updateStudentAdmin);

  const onSave = () => {
    void (async () => {
      setSaveError(null);
      try {
        if (
          isAdminOrSuper(activeUserRole) &&
          resolvedBackendId &&
          teacherBackendId !== resolvedTeacherBackendId
        ) {
          await updateStudentAdmin(resolvedBackendId, { teacherId: teacherBackendId });
          const teacherName =
            teacherOptions.find((t) => t.backendId === teacherBackendId)?.fullName ?? '—';
          setStudentForm((prev) => ({ ...prev, teacherName }));
        }
        if (resolvedBackendId) {
          const validColor =
            studentForm.color && /^#[0-9a-fA-F]{6}$/.test(studentForm.color)
              ? studentForm.color
              : null;
          if (activeUserRole === USER_ROLE.teacher.id) {
            if (validColor) {
              await updateStudentAdmin(resolvedBackendId, { displayColor: validColor });
            }
          } else if (isAdminOrSuper(activeUserRole)) {
            await updateStudentAdmin(resolvedBackendId, {
              nativeLanguageId: nativeLanguageId || null,
              learningLanguageIds: backendRow?.learningLanguageIds ?? [],
              scheduleType: studentForm.scheduleType,
              lessonFormat: studentForm.lessonFormat ?? 'mixed',
              ...(validColor ? { displayColor: validColor } : {}),
            });
          }
        }
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 2000);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save');
      }
    })();
  };

  return { savedProfile, saveError, setSaveError, onSave };
}
