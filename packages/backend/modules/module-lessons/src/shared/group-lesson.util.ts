import { BadRequestException } from '@nestjs/common';
import type {
  CreateScheduledLessonRequestDto,
  SchoolGroupLessonsSettingsDto,
} from '@pkg/types';
import { GROUP_LESSONS_FEATURE_DISABLED_MESSAGE, isGroupLessonsEnabled } from '@pkg/types';
import { canJoinGroupLesson, canTakeIndividualLesson } from './lesson-format.util';
import {
  groupBillingModeFromDto,
  groupSplitModeFromDto,
  lessonKindFromDto,
} from './lessons-map.util';
import { billingSnapshotFromGroup } from './student-group-map.util';

export function resolveLessonKind(body: CreateScheduledLessonRequestDto): 'INDIVIDUAL' | 'GROUP' {
  return lessonKindFromDto(body.kind ?? 'individual');
}

export function resolveParticipantIds(body: CreateScheduledLessonRequestDto): string[] {
  const ids =
    body.participantIds && body.participantIds.length > 0
      ? body.participantIds
      : body.studentId
        ? [body.studentId]
        : [];
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) {
    throw new BadRequestException('At least one student is required');
  }
  return unique;
}

export function assertGroupLessonsEnabledForSchool(
  paymentConfig: { groupLessons?: SchoolGroupLessonsSettingsDto },
): void {
  if (!isGroupLessonsEnabled(paymentConfig)) {
    throw new BadRequestException(GROUP_LESSONS_FEATURE_DISABLED_MESSAGE);
  }
}

export function assertParticipantLessonFormats(
  students: Array<{ id: string; lessonFormat: 'INDIVIDUAL_ONLY' | 'GROUP_ONLY' | 'MIXED' }>,
  kind: 'INDIVIDUAL' | 'GROUP',
): void {
  for (const student of students) {
    if (kind === 'GROUP' && !canJoinGroupLesson(student.lessonFormat)) {
      throw new BadRequestException(
        `Student ${student.id} is configured for individual lessons only`,
      );
    }
    if (kind === 'INDIVIDUAL' && !canTakeIndividualLesson(student.lessonFormat)) {
      throw new BadRequestException(`Student ${student.id} is configured for group lessons only`);
    }
  }
}

export function assertGroupCreateRules(
  kind: 'INDIVIDUAL' | 'GROUP',
  participantIds: string[],
  body: CreateScheduledLessonRequestDto,
  options?: { fromStudentGroup?: boolean; actorRole?: string },
): void {
  if (kind === 'GROUP' && participantIds.length < 2) {
    throw new BadRequestException('Group lessons require at least two students');
  }
  if (kind !== 'GROUP') return;

  if (options?.actorRole === 'TEACHER' && !body.studentGroupId) {
    throw new BadRequestException('Teachers must select a student group');
  }

  if (options?.fromStudentGroup) return;

  const billing = body.groupBilling;
  if (!billing?.mode) {
    throw new BadRequestException('Group billing mode is required');
  }
  const mode = groupBillingModeFromDto(billing.mode);
  if (mode === 'FIXED_TOTAL') {
    if (billing.priceMinor == null || billing.priceMinor < 0) {
      throw new BadRequestException('Group price is required for fixed total billing');
    }
    if (!billing.currency?.trim()) {
      throw new BadRequestException('Currency is required for fixed total billing');
    }
    const split = billing.splitMode ? groupSplitModeFromDto(billing.splitMode) : null;
    if (!split) {
      throw new BadRequestException('Split mode is required for fixed total billing');
    }
    if (split === 'SINGLE_PAYER') {
      if (!billing.payerUserId || !participantIds.includes(billing.payerUserId)) {
        throw new BadRequestException('Payer must be one of the group participants');
      }
    }
  }
}

export function groupBillingUpdateData(
  body: Pick<CreateScheduledLessonRequestDto, 'kind' | 'groupBilling'>,
) {
  if (body.kind !== 'group' && body.kind !== undefined) {
    return {
      kind: lessonKindFromDto(body.kind ?? 'individual'),
      groupBillingMode: null,
      groupPriceMinor: null,
      groupCurrency: null,
      groupSplitMode: null,
      groupPayerUserId: null,
    };
  }
  if (!body.groupBilling?.mode) return {};
  return groupBillingCreateData(body as CreateScheduledLessonRequestDto);
}

export function groupBillingCreateData(body: CreateScheduledLessonRequestDto) {
  const billing = body.groupBilling;
  if (!billing?.mode) return {};
  const mode = groupBillingModeFromDto(billing.mode);
  return {
    groupBillingMode: mode,
    groupPriceMinor: mode === 'FIXED_TOTAL' ? billing.priceMinor ?? null : null,
    groupCurrency: mode === 'FIXED_TOTAL' ? billing.currency?.trim() ?? null : null,
    groupSplitMode:
      mode === 'FIXED_TOTAL' && billing.splitMode
        ? groupSplitModeFromDto(billing.splitMode)
        : null,
    groupPayerUserId:
      mode === 'FIXED_TOTAL' && billing.splitMode === 'single_payer'
        ? billing.payerUserId ?? null
        : null,
  };
}

export function groupBillingFromSnapshot(snapshot: ReturnType<typeof billingSnapshotFromGroup>) {
  return snapshot;
}

export function participantRoleForBilling(
  userId: string,
  snapshot: ReturnType<typeof billingSnapshotFromGroup>,
): 'STUDENT' | 'PAYER' {
  if (
    snapshot.groupBillingMode === 'FIXED_TOTAL' &&
    snapshot.groupSplitMode === 'SINGLE_PAYER' &&
    snapshot.groupPayerUserId === userId
  ) {
    return 'PAYER';
  }
  return 'STUDENT';
}
