import type {
  SpeakingSubmissionStatusDto,
  SpeakingTopicAssignmentStatusDto,
} from '@pkg/types';

export function mapAssignmentStatus(
  status: 'PENDING' | 'SUBMITTED' | 'REVIEWED',
): SpeakingTopicAssignmentStatusDto {
  return status.toLowerCase() as SpeakingTopicAssignmentStatusDto;
}

export function mapSubmissionStatus(
  status: 'SUBMITTED' | 'REVIEWED',
): SpeakingSubmissionStatusDto {
  return status.toLowerCase() as SpeakingSubmissionStatusDto;
}
