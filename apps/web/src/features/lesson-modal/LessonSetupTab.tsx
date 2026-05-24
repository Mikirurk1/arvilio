'use client';

import type { LessonRecurrence } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { LessonPartyScheduleTimes } from '../../components/lessons/LessonPartyScheduleTimes';
import { Button, Field } from '../../components/ui';
import { isAdminOrSuper, USER_ROLE } from '../../mocks';
import type { SetupTabProps } from './tabTypes';
import styles from './LessonModal.module.scss';

export function LessonSetupTab({
  text,
  canEdit,
  role,
  form,
  students,
  teachers,
  weekDayOptions,
  recurrenceAllowed = true,
  onChange,
}: SetupTabProps) {
  const showTeacherField = isAdminOrSuper(role);
  const canEditWeekDays = canEdit && role !== USER_ROLE.student.id;
  const selectedStudent = students.find((student) => student.id === form.studentId);
  const selectedTeacher = teachers.find((teacher) => teacher.id === form.teacherId);
  return (
    <div className={`${styles.modalFieldsGrid} ${styles.modalSetupGrid}`}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{text.fields.title}</label>
        <Field className={styles.fieldInput} value={form.title} readOnly={!canEdit} onChange={(e) => onChange({ ...form, title: e.target.value })} />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{text.fields.date}</label>
        <Field type="date" className={styles.fieldInput} value={form.date} readOnly={!canEdit} onChange={(e) => onChange({ ...form, date: e.target.value })} />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{text.fields.startTime}</label>
        <Field type="time" className={styles.fieldInput} value={form.startTime} readOnly={!canEdit} onChange={(e) => onChange({ ...form, startTime: e.target.value })} />
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
        <label className={styles.fieldLabel}>{text.fields.duration}</label>
        <Field type="number" className={styles.fieldInput} min={55} step={5} value={String(form.duration)} readOnly={!canEdit} onChange={(e) => onChange({ ...form, duration: Math.max(55, Number(e.target.value) || 55) })} />
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
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{text.fields.student}</label>
          <Field as="select" className={styles.fieldInput} value={String(form.studentId)} readOnly={!canEdit} onChange={(e) => {
            const nextStudent = students.find((student) => student.id === Number(e.target.value));
            if (!nextStudent) return;
            const flexible = nextStudent.scheduleType === false;
            onChange({
              ...form,
              studentId: nextStudent.id,
              studentName: nextStudent.fullName,
              recurrence: flexible ? 'none' : form.recurrence,
              weeklyDays: flexible ? [] : form.weeklyDays,
            });
          }}>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </Field>
        </div>
      ) : null}
    </div>
  );
}
