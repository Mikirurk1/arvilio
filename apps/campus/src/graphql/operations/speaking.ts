const SPEAKING_TOPIC_ASSIGNMENT_FIELDS = `
  id
  studentId
  status
  personalNote
  dueDate
`;

const SPEAKING_SUBMISSION_SUMMARY_FIELDS = `
  id
  status
  durationSec
  teacherFeedback
  submittedAt
  hasAudio
`;

const SPEAKING_TOPIC_CARD_FIELDS = `
  id
  title
  prompt
  wordIds
  ownerId
  createdAt
  assignment {
    ${SPEAKING_TOPIC_ASSIGNMENT_FIELDS}
  }
  latestSubmission {
    ${SPEAKING_SUBMISSION_SUMMARY_FIELDS}
  }
`;

const SPEAKING_SUBMISSION_FIELDS = `
  ${SPEAKING_SUBMISSION_SUMMARY_FIELDS}
  topicId
  assignmentId
  studentId
  topicTitle
  topicPrompt
  topicWordIds
`;

export const MY_SPEAKING_TOPICS = `
  query MySpeakingTopics {
    mySpeakingTopics {
      ${SPEAKING_TOPIC_CARD_FIELDS}
    }
  }
`;

export const STUDENT_SPEAKING_TOPICS = `
  query StudentSpeakingTopics($studentId: ID!) {
    studentSpeakingTopics(studentId: $studentId) {
      ${SPEAKING_TOPIC_CARD_FIELDS}
    }
  }
`;

export const STUDENT_SPEAKING_SUBMISSIONS = `
  query StudentSpeakingSubmissions($studentId: ID!) {
    studentSpeakingSubmissions(studentId: $studentId) {
      ${SPEAKING_SUBMISSION_FIELDS}
    }
  }
`;

export const CREATE_SPEAKING_TOPIC = `
  mutation CreateSpeakingTopic($input: CreateSpeakingTopicInput!) {
    createSpeakingTopic(input: $input) {
      ${SPEAKING_TOPIC_CARD_FIELDS}
    }
  }
`;

export const DELETE_SPEAKING_TOPIC = `
  mutation DeleteSpeakingTopic($id: ID!) {
    deleteSpeakingTopic(id: $id)
  }
`;

export const SUBMIT_SPEAKING_RECORDING = `
  mutation SubmitSpeakingRecording($input: SubmitSpeakingRecordingInput!) {
    submitSpeakingRecording(input: $input) {
      ${SPEAKING_SUBMISSION_FIELDS}
    }
  }
`;

export const REVIEW_SPEAKING_SUBMISSION = `
  mutation ReviewSpeakingSubmission($input: ReviewSpeakingSubmissionInput!) {
    reviewSpeakingSubmission(input: $input) {
      ${SPEAKING_SUBMISSION_FIELDS}
    }
  }
`;
