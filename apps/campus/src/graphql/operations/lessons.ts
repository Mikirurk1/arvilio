const SCHEDULED_LESSON_LIST_FIELDS = `
      id
      title
      description
      notes
      lessonPlan
      date
      startTime
      endTime
      duration
      timezone
      teacherId
      teacherName
      studentId
      studentName
      status
      cancelReason
      credited
      recurrence
      weeklyDays
      seriesId
      order
      videoProvider
      videoMeetingUrl
      videoMeetingExternalId
      videoMeetingStartedAt
      videoMeetingEndedAt
      googleMeetUrl
      googleCalendarEventId
      meetCreatedAt
      linkedWordIds
      kind
      participants { userId displayName role sortOrder }
      groupBilling { mode priceMinor currency splitMode payerUserId }
      materials {
        id kind text files fileLinks { ref fileName downloadPath }
        libraryMaterialId
        sharedLibraryAssetIds
        libraryMediaSelectionApplied
        libraryMaterial {
          id title description kind tags level publisher
          assets {
            id role deliveryKind url label sortOrder
            fileAttachmentId fileName downloadPath
          }
        }
      }
      homework { text files fileLinks { ref fileName downloadPath } }
      studentResponse {
        text
        files
        fileLinks { ref fileName downloadPath }
        status
        homeworkChecked
        teacherHomeworkFeedback
      }
`;

const SCHEDULED_LESSON_FIELDS = `
  id
  title
  description
  notes
  lessonPlan
  date
  startTime
  endTime
  duration
  timezone
  teacherId
  teacherName
  studentId
  studentName
  status
  cancelReason
  credited
  recurrence
  weeklyDays
  seriesId
  order
  videoProvider
  videoMeetingUrl
  googleMeetUrl
  kind
  participants { userId displayName role sortOrder }
  groupBilling { mode priceMinor currency splitMode payerUserId }
  materials {
    id kind text files fileLinks { ref fileName downloadPath }
    libraryMaterialId
    sharedLibraryAssetIds
    libraryMediaSelectionApplied
    libraryMaterial {
      id title description kind tags level publisher
      assets {
        id role deliveryKind url label sortOrder
        fileAttachmentId fileName downloadPath
      }
    }
  }
  homework { text files fileLinks { ref fileName downloadPath } }
  studentResponse {
    text
    files
    fileLinks { ref fileName downloadPath }
    status
    homeworkChecked
    teacherHomeworkFeedback
  }
`;

export const SCHEDULED_LESSONS_PAGE = `
  query ScheduledLessonsPage($cursor: String, $limit: Int, $studentId: ID) {
    scheduledLessonsPage(cursor: $cursor, limit: $limit, studentId: $studentId) {
      hasMore
      nextCursor
      items {
${SCHEDULED_LESSON_LIST_FIELDS}
      }
    }
  }
`;

export const SCHEDULED_LESSONS = `
  query ScheduledLessons {
    scheduledLessons {
${SCHEDULED_LESSON_LIST_FIELDS}
    }
  }
`;

export const CREATE_SCHEDULED_LESSON = `
  mutation CreateScheduledLesson($input: CreateScheduledLessonInput!) {
    createScheduledLesson(input: $input) {
      ${SCHEDULED_LESSON_FIELDS}
    }
  }
`;

export const ENSURE_SCHEDULED_LESSON_MEET = `
  mutation EnsureScheduledLessonMeet($id: ID!) {
    ensureScheduledLessonMeet(id: $id) {
      ${SCHEDULED_LESSON_FIELDS}
    }
  }
`;

export const UPDATE_SCHEDULED_LESSON = `
  mutation UpdateScheduledLesson($id: ID!, $input: UpdateScheduledLessonInput!) {
    updateScheduledLesson(id: $id, input: $input) {
      ${SCHEDULED_LESSON_FIELDS}
    }
  }
`;

export const DELETE_SCHEDULED_LESSON = `
  mutation DeleteScheduledLesson($id: ID!) {
    deleteScheduledLesson(id: $id) { ok }
  }
`;
