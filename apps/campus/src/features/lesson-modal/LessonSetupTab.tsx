'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LessonRecurrence, StudentGroupDto, StudentLessonFormat } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { User, Users } from 'lucide-react';
import { LessonPartyScheduleTimes } from '../../components/lessons/LessonPartyScheduleTimes';
import { Button, Field } from '../../components/ui';
import { StudentSelectField } from '../../components/students';
import { isAdminOrSuper } from '../../lib/roles';
import { USER_ROLE } from '@pkg/types';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import { STUDENT_GROUPS } from '../../graphql/operations';
import { graphqlRequest } from '../../lib/graphql-client';
import { partyNumericId } from './scheduledLessonsBackendAdapter';
import type { SetupTabProps } from './tabTypes';
import styles from './LessonModal.module.scss';

function canPickForIndividual(lessonFormat?: StudentLessonFormat): boolean {
  return !lessonFormat || lessonFormat === 'individual_only' || lessonFormat === 'mixed';
}

export function LessonSetupTab({
  text,
  canEdit,
  role,
  form,
  students,
  teachers,
  weekDayOptions,
  recurrenceAllowed = true,
  fieldErrors = {},
  onChange,
}: SetupTabProps) {
  const showTeacherField = isAdminOrSuper(role);
  const canEditWeekDays = canEdit && role !== USER_ROLE.student.id;
  const selectedStudent = students.find((student) => student.id === form.studentId);
  const selectedTeacher = teachers.find((teacher) => teacher.id === form.teacherId);
  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();
  const [studentGroups, setStudentGroups] = useState<StudentGroupDto[]>([]);
  const selectedGroup = useMemo(
    () => studentGroups.find((group) => group.id === form.studentGroupId) ?? null,
    [studentGroups, form.studentGroupId],
  );

  useEffect(() => {
    if (!groupLessonsEnabled || role === USER_ROLE.student.id) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await graphqlRequest<{ studentGroups: StudentGroupDto[] }>(STUDENT_GROUPS);
        if (!cancelled) setStudentGroups(data.studentGroups);
      } catch {
        if (!cancelled) setStudentGroups([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupLessonsEnabled, role]);

  const applyStudentGroup = (group: StudentGroupDto) => {
    const participantIds = group.members.map((member) => partyNumericId(member.userId));
    const primaryId = participantIds[0] ?? form.studentId;
    const primaryStudent = students.find((s) => s.id === primaryId);
    onChange({
      ...form,
      kind: 'group',
      studentGroupId: group.id,
      participantIds,
      studentId: primaryId,
      studentName: primaryStudent?.fullName ?? form.studentName,
    });
  };

  return (
    <div className={`${styles.modalFieldsGrid} ${styles.modalSetupGrid}`}>
      <div className={styles.fieldGroup} {...(fieldErrors.title ? { 'data-field-error': 'title' } : {})}>
        <label className={styles.fieldLabel} htmlFor="lesson-setup-title">{text.fields.title}</label>
        <Field
          id="lesson-setup-title"
          className={styles.fieldInput}
          value={form.title}
          readOnly={!canEdit}
          error={fieldErrors.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />
      </div>
      <div className={styles.fieldGroup} {...(fieldErrors.date ? { 'data-field-error': 'date' } : {})}>
        <label className={styles.fieldLabel}>{text.fields.date}</label>
        <Field
          type="date"
          className={styles.fieldInput}
          value={form.date}
          readOnly={!canEdit}
          error={fieldErrors.date}
          onChange={(e) => onChange({ ...form, date: e.target.value })}
        />
      </div>
      <div className={styles.fieldGroup} {...(fieldErrors.startTime ? { 'data-field-error': 'startTime' } : {})}>
        <label className={styles.fieldLabel}>{text.fields.startTime}</label>
        <Field
          type="time"
          className={styles.fieldInput}
          value={form.startTime}
          readOnly={!canEdit}
          error={fieldErrors.startTime}
          onChange={(e) => onChange({ ...form, startTime: e.target.value })}
        />
        <LessonPartyScheduleTimes
          wall={{
            date: form.date,
            startTime: form.startTime,
            duration: form.duration,
            timezoneId: form.timezoneId,
          }}
          role={role}
          teacherTimezoneIana={selectedTeacher?.timezoneIana}
          studentTimezoneIana={selectedStudent?.timezoneIana}
          teacherName={form.teacherName}
          studentName={form.studentName}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="lesson-setup-duration">{text.fields.duration}</label>
        <Field id="lesson-setup-duration" type="number" className={styles.fieldInput} min={55} step={5} value={String(form.duration)} readOnly={!canEdit} onChange={(e) => onChange({ ...form, duration: Math.max(55, Number(e.target.value) || 55) })} />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{text.fields.recurrence}</label>
        <Field as="select"
          className={styles.fieldInput}
          value={form.recurrence}
          readOnly={!canEdit || !recurrenceAllowed}
          onChange={(e) => onChange({ ...form, recurrence: e.target.value as LessonRecurrence })}
        >
          <option value="none">{text.options.noRepeat}</option>
          <option value="daily" disabled={!recurrenceAllowed}>{text.options.daily}</option>
          <option value="weekly" disabled={!recurrenceAllowed}>{text.options.weekly}</option>
          <option value="monthly" disabled={!recurrenceAllowed}>{text.options.monthly}</option>
        </Field>
        {!recurrenceAllowed ? (
          <p className={styles.fieldHint}>{text.hints.recurrenceFixedOnly}</p>
        ) : null}
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{text.fields.status}</label>
        <Field as="select" className={styles.fieldInput} value={String(form.statusId)} readOnly={!canEdit} onChange={(e) => {
          const nextStatusId = Number(e.target.value) as typeof form.statusId;
          onChange({
            ...form,
            statusId: nextStatusId,
            cancelReason:
              nextStatusId === LESSON_STATUS.cancelled.id
                ? form.cancelReason
                : undefined,
          });
        }}>
          <option value={LESSON_STATUS.planned.id}>{text.options.planned}</option>
          <option value={LESSON_STATUS.completed.id}>{text.options.completed}</option>
          <option value={LESSON_STATUS.cancelled.id}>{text.options.cancelled}</option>
        </Field>
      </div>
      {form.statusId === LESSON_STATUS.cancelled.id ? (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{text.fields.cancelReason}</label>
          <Field as="select" className={styles.fieldInput} value={form.cancelReason ?? 'student_absent'} readOnly={!canEdit} onChange={(e) => onChange({ ...form, cancelReason: e.target.value as NonNullable<typeof form.cancelReason> })}>
            <option value="student_absent">{text.options.studentAbsent}</option>
            <option value="student_requested_cancel">{text.options.studentRequestedCancel}</option>
            <option value="teacher_absent">{text.options.teacherAbsent}</option>
          </Field>
        </div>
      ) : null}
      {form.statusId === LESSON_STATUS.cancelled.id ? (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{text.fields.credited}</label>
          <Field as="select" className={styles.fieldInput} value={form.credited ? 'yes' : 'no'} readOnly={!canEdit} onChange={(e) => onChange({ ...form, credited: e.target.value === 'yes' })}>
            <option value="yes">{text.options.credited}</option>
            <option value="no">{text.options.notCredited}</option>
          </Field>
        </div>
      ) : null}
      {form.recurrence === 'weekly' ? (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{text.fields.weekDays}</label>
          <div className={styles.weekDaysRow}>
            {weekDayOptions.map((day) => {
              const selected = form.weeklyDays.includes(day.value);
              return (
                <Button
                  key={day.value}
                  type="button"
                  className={`${styles.weekDayChip} ${selected ? styles.weekDayChipActive : ''}`}
                  disabled={!canEditWeekDays}
                  onClick={() => {
                    if (!canEditWeekDays) return;
                    const next = selected
                      ? form.weeklyDays.filter((weekday) => weekday !== day.value)
                      : [...form.weeklyDays, day.value];
                    onChange({ ...form, weeklyDays: next.sort((a, b) => a - b) });
                  }}
                >
                  {day.label}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
      {showTeacherField ? (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Teacher</label>
          <Field as="select"
            className={styles.fieldInput}
            value={String(form.teacherId)}
            readOnly={!canEdit}
            onChange={(e) => {
              const nextTeacher = teachers.find((teacher) => teacher.id === Number(e.target.value));
              if (!nextTeacher) return;
              onChange({
                ...form,
                teacherId: nextTeacher.id,
                teacherName: nextTeacher.fullName,
              });
            }}
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName}
              </option>
            ))}
          </Field>
        </div>
      ) : null}
      {role !== USER_ROLE.student.id ? (
        <>
          {groupLessonsEnabled ? (
            <div className={`${styles.fieldGroup} ${styles.kindToggleRow}`}>
              <label className={styles.fieldLabel}>{text.fields.lessonType ?? 'Lesson type'}</label>
              <div className={styles.kindToggle}>
                <Button
                  type="button"
                  className={`${styles.kindToggleBtn} ${form.kind === 'individual' ? styles.kindToggleBtnActive : ''}`}
                  disabled={!canEdit}
                  onClick={() => {
                    // When switching group→individual, keep studentId only if it resolves
                    // to a known individual student; otherwise reset so the user picks one.
                    const primaryId =
                      form.participantIds?.[0] ?? form.studentId;
                    const resolvedStudent = students.find((s) => s.id === primaryId);
                    const nextStudentId = resolvedStudent?.id ?? 0;
                    onChange({
                      ...form,
                      kind: 'individual',
                      studentGroupId: null,
                      studentId: nextStudentId,
                      studentName: resolvedStudent?.fullName ?? form.studentName,
                      participantIds: nextStudentId ? [nextStudentId] : [],
                    });
                  }}
                >
                  <User size={16} aria-hidden />
                  <span>{text.options?.individualLesson ?? 'Individual'}</span>
                </Button>
                <Button
                  type="button"
                  className={`${styles.kindToggleBtn} ${form.kind === 'group' ? styles.kindToggleBtnActive : ''}`}
                  disabled={!canEdit || studentGroups.length === 0}
                  onClick={() => {
                    const first = studentGroups[0];
                    if (first) applyStudentGroup(first);
                    else onChange({ ...form, kind: 'group', studentGroupId: null });
                  }}
                >
                  <Users size={16} aria-hidden />
                  <span>{text.options?.groupLesson ?? 'Group'}</span>
                </Button>
              </div>
            </div>
          ) : null}
          {form.kind === 'group' && groupLessonsEnabled ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  {text.fields.studentGroup ?? 'Learning group'}
                </label>
                <Field
                  as="select"
                  className={styles.fieldInput}
                  value={form.studentGroupId ?? ''}
                  readOnly={!canEdit}
                  onChange={(e) => {
                    const group = studentGroups.find((row) => row.id === e.target.value);
                    if (group) applyStudentGroup(group);
                  }}
                >
                  <option value="" disabled>
                    Select a group
                  </option>
                  {studentGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                      {group.teacherName ? ` · ${group.teacherName}` : ''}
                    </option>
                  ))}
                </Field>
                {studentGroups.length === 0 ? (
                  <p className={styles.fieldHint}>
                    No groups yet. An admin can create learning groups under Students → Groups.
                  </p>
                ) : null}
              </div>
              {selectedGroup ? (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{text.fields.students ?? 'Students'}</label>
                  <ul className={styles.groupStudentsReadonly}>
                    {selectedGroup.members.map((member) => (
                      <li key={member.userId}>{member.displayName}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{text.fields.student}</label>
              <StudentSelectField
                className={styles.fieldInput}
                value={String(form.studentId)}
                valueKind="partyId"
                readOnly={!canEdit}
                fallbackLabel={form.studentName}
                filter={(student) =>
                  !groupLessonsEnabled || canPickForIndividual(student.lessonFormat ?? 'mixed')
                }
                onValueChange={(nextValue, student) => {
                  if (!student) return;
                  const nextId = Number(nextValue);
                  const flexible = student.scheduleType === false;
                  onChange({
                    ...form,
                    studentId: nextId,
                    studentName: student.displayName,
                    participantIds: [nextId],
                    recurrence: flexible ? 'none' : form.recurrence,
                    weeklyDays: flexible ? [] : form.weeklyDays,
                    groupPayerUserId: nextId,
                    studentGroupId: null,
                    kind: 'individual',
                  });
                }}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
