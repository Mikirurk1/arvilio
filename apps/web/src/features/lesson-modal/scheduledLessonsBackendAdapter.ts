import {
  LESSON_STATUS,
  TIME_ZONE,
  USER_ROLE,
  type ScheduledLessonBackendDto,
  type ScheduledLessonDto,
  type LessonStatusId,
  type LessonRecurrence,
  type TimeZoneId,
  type UserRoleId,
} from '@pkg/types';

/**
 * Stable string→number id mapping for scheduled lessons and parties (teachers,
 * students). Separate counters prevent party UUIDs from colliding with lesson
 * numeric ids used as React keys and in `nextLessonEntityId()`.
 */
const lessonStringToNumber = new Map<string, number>();
const lessonNumberToString = new Map<number, string>();
let nextLessonSyntheticId = 1_000_001;

const partyStringToNumber = new Map<string, number>();
const partyNumberToString = new Map<number, string>();
let nextPartySyntheticId = 2_000_001;

export function lessonNumericId(stringId: string): number {
  const existing = lessonStringToNumber.get(stringId);
  if (existing !== undefined) return existing;
  const id = nextLessonSyntheticId++;
  lessonStringToNumber.set(stringId, id);
  lessonNumberToString.set(id, stringId);
  return id;
}

export function partyNumericId(stringId: string): number {
  const existing = partyStringToNumber.get(stringId);
  if (existing !== undefined) return existing;
  const id = nextPartySyntheticId++;
  partyStringToNumber.set(stringId, id);
  partyNumberToString.set(id, stringId);
  return id;
}

export function lessonStringId(numericId: number): string | undefined {
  return lessonNumberToString.get(numericId);
}

export function partyStringId(numericId: number): string | undefined {
  return partyNumberToString.get(numericId);
}

/** Stable key for list reconciliation (React keys, dedupe, upsert). */
export function scheduledLessonIdentity(
  lesson: Pick<ScheduledLessonDto, 'id' | 'backendId'>,
): string {
  return lesson.backendId ? `backend:${lesson.backendId}` : `local:${lesson.id}`;
}

/** Route segment for lesson detail pages (prefer backend UUID when present). */
export function getLessonRouteId(lesson: Pick<ScheduledLessonDto, 'id' | 'backendId'>): string {
  const backendId = getLessonBackendId(lesson);
  return backendId ?? String(lesson.id);
}

export function dedupeScheduledLessons(lessons: ScheduledLessonDto[]): ScheduledLessonDto[] {
  const byIdentity = new Map<string, ScheduledLessonDto>();
  for (const lesson of lessons) {
    const key = scheduledLessonIdentity(lesson);
    const existing = byIdentity.get(key);
    if (!existing) {
      byIdentity.set(key, lesson);
      continue;
    }
    if (lesson.backendId && !existing.backendId) {
      byIdentity.set(key, lesson);
    }
  }

  const byNumericId = new Map<number, ScheduledLessonDto>();
  for (const lesson of Array.from(byIdentity.values())) {
    const existing = byNumericId.get(lesson.id);
    if (!existing) {
      byNumericId.set(lesson.id, lesson);
      continue;
    }
    if (lesson.backendId && !existing.backendId) {
      byNumericId.set(lesson.id, lesson);
    }
  }
  return Array.from(byNumericId.values());
}

export function upsertScheduledLesson(
  lessons: ScheduledLessonDto[],
  lesson: ScheduledLessonDto,
): ScheduledLessonDto[] {
  const identity = scheduledLessonIdentity(lesson);
  const without = lessons.filter((row) => {
    if (scheduledLessonIdentity(row) === identity) return false;
    if (lesson.backendId && row.id === lesson.id && !row.backendId) return false;
    return true;
  });
  return dedupeScheduledLessons([...without, lesson]);
}

/** Resolve backend UUID from numeric UI id or a raw UUID route param. */
export function resolveLessonBackendId(id: number | string): string | undefined {
  if (typeof id === 'string') {
    const trimmed = id.trim();
    if (trimmed.length >= 20 && trimmed.includes('-')) return trimmed;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return lessonStringId(numeric);
    return undefined;
  }
  return lessonStringId(id);
}

const ianaToTimeZoneId: Record<string, TimeZoneId> = (
  Object.keys(TIME_ZONE) as (keyof typeof TIME_ZONE)[]
).reduce(
  (acc, key) => {
    const zone = TIME_ZONE[key];
    acc[zone.iana] = zone.id;
    return acc;
  },
  {} as Record<string, TimeZoneId>,
);

function timezoneToId(timezone: string): TimeZoneId {
  return ianaToTimeZoneId[timezone] ?? TIME_ZONE.kyiv.id;
}

function statusToId(status: ScheduledLessonBackendDto['status']): LessonStatusId {
  if (status === 'completed') return LESSON_STATUS.completed.id;
  if (status === 'cancelled') return LESSON_STATUS.cancelled.id;
  return LESSON_STATUS.planned.id;
}

function statusFromId(id: LessonStatusId): ScheduledLessonBackendDto['status'] {
  if (id === LESSON_STATUS.completed.id) return 'completed';
  if (id === LESSON_STATUS.cancelled.id) return 'cancelled';
  return 'planned';
}

export function getLessonBackendId(
  lesson: Pick<ScheduledLessonDto, 'id' | 'backendId'>,
): string | undefined {
  return lesson.backendId ?? lessonStringId(lesson.id);
}

/** Whether a lesson belongs to the viewer for student/teacher role filters. */
export function lessonIncludesViewer(
  lesson: Pick<ScheduledLessonDto, 'studentId' | 'teacherId' | 'participantIds'>,
  viewerPartyNumericId: number | null | undefined,
  role: UserRoleId,
): boolean {
  if (role !== USER_ROLE.student.id && role !== USER_ROLE.teacher.id) return true;
  if (viewerPartyNumericId == null) return false;
  if (role === USER_ROLE.student.id) {
    if (lesson.studentId === viewerPartyNumericId) return true;
    return lesson.participantIds?.includes(viewerPartyNumericId) ?? false;
  }
  return lesson.teacherId === viewerPartyNumericId;
}

export function fromBackendLesson(dto: ScheduledLessonBackendDto): ScheduledLessonDto {
  return {
    id: lessonNumericId(dto.id),
    backendId: dto.id,
    title: dto.title,
    description: dto.description ?? undefined,
    notes: dto.notes ?? undefined,
    lessonPlan: dto.lessonPlan ?? undefined,
    date: dto.date,
    startTime: dto.startTime,
    endTime: dto.endTime,
    duration: dto.duration,
    timezoneId: timezoneToId(dto.timezone),
    teacherId: partyNumericId(dto.teacherId),
    teacherName: dto.teacherName?.trim() ?? '',
    studentId: partyNumericId(dto.studentId),
    studentName: dto.studentName?.trim() ?? '',
    statusId: statusToId(dto.status),
    cancelReason: dto.cancelReason ?? undefined,
    credited: dto.credited,
    recurrence: dto.recurrence as LessonRecurrence,
    weeklyDays: dto.weeklyDays,
    seriesId: dto.seriesId ?? undefined,
    order: dto.order,
    videoProvider: dto.videoProvider ?? null,
    videoMeetingUrl: dto.videoMeetingUrl ?? dto.googleMeetUrl ?? null,
    googleMeetUrl: dto.googleMeetUrl ?? null,
    materials: dto.materials.map((material) => ({
      id: material.id,
      kind: material.kind,
      text: material.text,
      files: material.files,
      fileLinks: material.fileLinks,
      libraryMaterialId: material.libraryMaterialId ?? null,
      sharedLibraryAssetIds: material.sharedLibraryAssetIds ?? [],
      libraryMediaSelectionApplied: material.libraryMediaSelectionApplied ?? false,
      libraryMaterial: material.libraryMaterial ?? null,
    })),
    homework: {
      text: dto.homework.text,
      files: dto.homework.files,
      fileLinks: dto.homework.fileLinks,
    },
    studentResponse: {
      ...dto.studentResponse,
      fileLinks: dto.studentResponse.fileLinks,
    },
    linkedWordIds: dto.linkedWordIds?.length ? [...dto.linkedWordIds] : undefined,
    kind: dto.kind ?? 'individual',
    participantIds: (dto.participants ?? []).map((row) => partyNumericId(row.userId)),
    participants: (dto.participants ?? []).map((row) => ({
      userId: partyNumericId(row.userId),
      displayName: row.displayName?.trim() ?? '',
      role: row.role,
      sortOrder: row.sortOrder,
    })),
    groupBilling: dto.groupBilling
      ? {
          ...dto.groupBilling,
          payerUserId: dto.groupBilling.payerUserId
            ? String(partyNumericId(dto.groupBilling.payerUserId))
            : null,
        }
      : undefined,
  };
}

export function fromBackendLessons(list: ScheduledLessonBackendDto[]): ScheduledLessonDto[] {
  return dedupeScheduledLessons(list.map(fromBackendLesson));
}

export function hydrateLessonPartyNames(
  lessons: ScheduledLessonDto[],
  nameByNumericId: Map<number, string>,
): ScheduledLessonDto[] {
  return lessons.map((lesson) => ({
    ...lesson,
    teacherName: nameByNumericId.get(lesson.teacherId) ?? lesson.teacherName,
    studentName: nameByNumericId.get(lesson.studentId) ?? lesson.studentName,
  }));
}

/**
 * Frontend → backend status helper used when sending mutations. Note: only
 * read paths are currently wired through this module; writes still pass
 * through the legacy local-state setter, which the calendar UI uses for
 * optimistic updates. Surfacing this helper here keeps the round-trip
 * mapping co-located for the next migration step.
 */
export { statusFromId };
