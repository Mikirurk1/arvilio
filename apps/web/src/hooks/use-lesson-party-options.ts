'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AssignableTeacherDto } from '@soenglish/shared-types';
import { partyNumericId } from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import { ASSIGNABLE_TEACHERS } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import { useOptionalAuth } from '../lib/auth-context';
import { useViewerPartyNumericId } from './use-viewer-party-numeric-id';
import { useStudentsStore } from '../stores/students-store';

export type LessonPartyOption = { id: number; fullName: string; backendId: string };

export function useLessonPartyOptions() {
  const auth = useOptionalAuth();
  const currentUserNumericId = useViewerPartyNumericId();
  const studentsSlice = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const [teachers, setTeachers] = useState<AssignableTeacherDto[]>([]);
  const [teachersReady, setTeachersReady] = useState(false);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await graphqlRequest<{ assignableTeachers: AssignableTeacherDto[] }>(
          ASSIGNABLE_TEACHERS,
        );
        if (!cancelled) setTeachers(data.assignableTeachers);
      } catch {
        if (!cancelled) setTeachers([]);
      } finally {
        if (!cancelled) setTeachersReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentOptions = useMemo<LessonPartyOption[]>(() => {
    const rows = studentsSlice.data ?? [];
    return rows.map((row) => ({
      id: partyNumericId(row.id),
      fullName: row.displayName,
      backendId: row.id,
    }));
  }, [studentsSlice.data]);

  const teacherOptions = useMemo<LessonPartyOption[]>(
    () =>
      teachers.map((row) => ({
        id: partyNumericId(row.id),
        fullName: row.displayName,
        backendId: row.id,
      })),
    [teachers],
  );

  const nameByNumericId = useMemo(() => {
    const map = new Map<number, string>();
    for (const option of [...studentOptions, ...teacherOptions]) {
      map.set(option.id, option.fullName);
    }
    return map;
  }, [studentOptions, teacherOptions]);

  const defaultTeacher = useMemo(() => {
    const authId = auth?.user?.id;
    if (authId) {
      const self = teacherOptions.find((row) => row.backendId === authId);
      if (self) return self;
    }
    return teacherOptions[0] ?? null;
  }, [teacherOptions, auth?.user?.id]);

  const defaultStudent = studentOptions[0] ?? null;

  const loading =
    studentsSlice.status === 'loading' ||
    studentsSlice.status === 'idle' ||
    !teachersReady;

  return {
    studentOptions,
    teacherOptions,
    defaultTeacher,
    defaultStudent,
    currentUserNumericId,
    nameByNumericId,
    loading,
  };
}
