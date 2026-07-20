import { useMemo } from 'react';
import type { ScheduledLessonDto } from '@pkg/types';
import { partyNumericId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { STUDENT_COLOR_PALETTE, type StudentColor } from './calendarUtils';

type StudentsApiRow = { id: string; displayColor?: string | null };
type VisibleStudent = { id: number; color?: string };

export function useCalendarColors(
  studentsFromApi: StudentsApiRow[] | null | undefined,
  visibleStudents: VisibleStudent[],
) {
  const studentColorById = useMemo(() => {
    const m = new Map<number, string | undefined>();
    for (const row of studentsFromApi ?? []) {
      const hex = row.displayColor?.trim();
      if (hex) m.set(partyNumericId(row.id), hex);
    }
    for (const student of visibleStudents) {
      if (!m.has(student.id)) {
        const fallback = student.color?.trim();
        if (fallback) m.set(student.id, fallback);
      }
    }
    return m;
  }, [studentsFromApi, visibleStudents]);

  const isHexColor = (value?: string | null) =>
    Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value));

  const colorHexFromStudentId = (studentId: number): string | null => {
    const colorHex = studentColorById.get(studentId);
    return isHexColor(colorHex) ? colorHex! : null;
  };

  const colorFromStudentId = (studentId: number): StudentColor => {
    const hex = colorHexFromStudentId(studentId);
    if (hex) {
      const lower = hex.toLowerCase();
      if (lower === '#16a97a') return 'Green';
      if (lower === '#f59e0b') return 'Amber';
      if (lower === '#8b5cf6') return 'Purple';
      return 'Blue';
    }
    const key = String(studentId);
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return STUDENT_COLOR_PALETTE[hash % STUDENT_COLOR_PALETTE.length];
  };

  const getLessonColor = (lesson: ScheduledLessonDto): StudentColor =>
    colorFromStudentId(lesson.studentId);

  const lessonColorStyles = (lesson: ScheduledLessonDto): React.CSSProperties => {
    const hex = colorHexFromStudentId(lesson.studentId);
    if (!hex) return {};
    return { backgroundColor: `${hex}1A`, borderLeftColor: hex };
  };

  return { colorHexFromStudentId, colorFromStudentId, getLessonColor, lessonColorStyles };
}
