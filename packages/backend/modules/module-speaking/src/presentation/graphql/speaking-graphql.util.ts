import type {
  SpeakingSubmissionSummaryDto,
  SpeakingTopicAssignmentDto,
  SpeakingTopicCardDto,
} from '@pkg/types';
import type { SpeakingSubmission, SpeakingTopic, SpeakingTopicAssignment } from '@prisma/client';
import { mapAssignmentStatus, mapSubmissionStatus } from '../../shared/speaking-status.util';

export function mapSubmissionSummary(
  row: Pick<
    SpeakingSubmission,
    | 'id'
    | 'status'
    | 'durationSec'
    | 'teacherFeedback'
    | 'submittedAt'
    | 'audioStorageKey'
  >,
): SpeakingSubmissionSummaryDto {
  return {
    id: row.id,
    status: mapSubmissionStatus(row.status),
    durationSec: row.durationSec,
    teacherFeedback: row.teacherFeedback,
    submittedAt: row.submittedAt.toISOString(),
    hasAudio: Boolean(row.audioStorageKey),
  };
}

export function mapAssignment(
  row: Pick<
    SpeakingTopicAssignment,
    'id' | 'studentId' | 'status' | 'personalNote' | 'dueDate'
  >,
): SpeakingTopicAssignmentDto {
  return {
    id: row.id,
    studentId: row.studentId,
    status: mapAssignmentStatus(row.status),
    personalNote: row.personalNote,
    dueDate: row.dueDate?.toISOString() ?? null,
  };
}

export function mapTopicCard(
  topic: SpeakingTopic,
  assignment: SpeakingTopicAssignment | null,
  latestSubmission: SpeakingSubmission | null,
): SpeakingTopicCardDto {
  return {
    id: topic.id,
    title: topic.title,
    prompt: topic.prompt,
    wordIds: topic.wordIds,
    ownerId: topic.ownerId,
    createdAt: topic.createdAt.toISOString(),
    assignment: assignment ? mapAssignment(assignment) : null,
    latestSubmission: latestSubmission ? mapSubmissionSummary(latestSubmission) : null,
  };
}
