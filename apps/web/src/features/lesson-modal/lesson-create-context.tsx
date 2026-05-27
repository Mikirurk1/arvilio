'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { USER_ROLE } from '../../mocks';
import { LessonModal } from './LessonModal';
import { ScheduledLessonsProvider } from './ScheduledLessonsProvider';
import { useLessonEditor } from './useLessonEditor';

type LessonCreateContextValue = {
  openCreateLesson: (date?: string) => void;
};

const LessonCreateContext = createContext<LessonCreateContextValue | null>(null);

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function LessonEditorHostInner({ children }: { children: ReactNode }) {
  const {
    canCreateLesson,
    modalMode,
    editingLesson,
    form,
    setForm,
    openCreateModal,
    closeModal,
    submitModal,
    saveStudentResponse,
    handleUnlinkSeries,
    handleDeleteSeries,
    handleDeleteLesson,
    visibleStudents,
    assignableTeachers,
    lessonBackendId,
    persistedLessonId,
    studentBackendId,
    recurrenceAllowed,
    canManageLessons,
    role,
  } = useLessonEditor();

  const openCreateLesson = useCallback(
    (date?: string) => {
      if (!canCreateLesson) return;
      openCreateModal(date ?? toDateString(new Date()));
    },
    [canCreateLesson, openCreateModal],
  );

  const contextValue = useMemo(() => ({ openCreateLesson }), [openCreateLesson]);

  return (
    <LessonCreateContext.Provider value={contextValue}>
      {children}
      {form ? (
        <LessonModal
          mode={modalMode}
          canEdit={canManageLessons}
          role={role}
          form={form}
          onChange={setForm}
          onClose={closeModal}
          recurrenceAllowed={recurrenceAllowed}
          canUnlinkSeries={
            modalMode === 'edit' && canManageLessons && Boolean(editingLesson?.seriesId)
          }
          onUnlinkSeries={handleUnlinkSeries}
          canDeleteSeries={
            modalMode === 'edit' && canManageLessons && Boolean(editingLesson?.seriesId)
          }
          onDeleteSeries={handleDeleteSeries}
          canDeleteLesson={modalMode === 'edit' && role !== USER_ROLE.student.id}
          onDeleteLesson={handleDeleteLesson}
          onSubmit={submitModal}
          onSaveStudentResponse={saveStudentResponse}
          students={visibleStudents}
          teachers={assignableTeachers}
          lessonBackendId={lessonBackendId}
          persistedLessonId={persistedLessonId}
          studentBackendId={studentBackendId}
        />
      ) : null}
    </LessonCreateContext.Provider>
  );
}

/** Opens the global create-lesson modal without changing the URL. */
export function useOpenCreateLesson(): () => void {
  const ctx = useContext(LessonCreateContext);
  if (!ctx) {
    throw new Error('useOpenCreateLesson must be used within LessonEditorHost');
  }
  return () => ctx.openCreateLesson();
}

/** Shared lesson list state + global create-lesson modal for app shell routes. */
export function LessonEditorHost({ children }: { children: ReactNode }) {
  return (
    <ScheduledLessonsProvider>
      <LessonEditorHostInner>{children}</LessonEditorHostInner>
    </ScheduledLessonsProvider>
  );
}
