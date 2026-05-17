export const PRACTICE_WEEK_SUMMARY = `
  query PracticeWeekSummary {
    practiceWeekSummary {
      practiceMinutes
      metrics {
        id
        label
        value
      }
    }
  }
`;

export const RECORD_PRACTICE_SESSION = `
  mutation RecordPracticeSession($input: RecordPracticeSessionInput!) {
    recordPracticeSession(input: $input) {
      id
      kind
      durationSec
    }
  }
`;

export const DASHBOARD_SUMMARY = `
  query DashboardSummary {
    dashboardSummary {
      role
      lessonsToday
      lessonsThisWeek
      lessonsCompleted
      vocabularyCount
      reviewCount
    }
  }
`;

export const DAILY_GOALS = `
  query DailyGoals {
    dailyGoals {
      id
      templateId
      text
      difficulty
      done
      xpReward
      dateKey
    }
  }
`;

export const SET_DAILY_GOAL_DONE = `
  mutation SetDailyGoalDone($goalId: ID!, $done: Boolean!) {
    setDailyGoalDone(goalId: $goalId, done: $done) {
      id
      templateId
      text
      difficulty
      done
      xpReward
      dateKey
    }
  }
`;

export const LEARNING_STREAK = `
  query LearningStreak {
    learningStreak {
      streakDays
      activeToday
      year
      month
      activeDays
    }
  }
`;

export const WORD_OF_DAY = `
  query WordOfDay {
    wordOfDay {
      wordId
      cardId
      text
      phonetic
      partOfSpeech
      definition
      example
    }
  }
`;

export const VOCABULARY_OVERVIEW = `
  query VocabularyOverview {
    vocabularyOverview {
      totalWords
      masteredWords
      dueToday
    }
  }
`;

const WORD_CARD_FIELDS = `
  id
  text
  definition
  definitions { languageId text lemmaText partOfSpeech }
  example
  phonetic
  partOfSpeech
  category
  audioUrl
  origin
  synonyms
  antonyms
  source
`;

export const LOOKUP_WORD = `
  query LookupWord($text: String!) {
    lookupWord(text: $text) {
      foundInDb
      foundInDictionary
      word { ${WORD_CARD_FIELDS} }
      preview { ${WORD_CARD_FIELDS} }
    }
  }
`;

export const WORD_DETAILS = `
  query WordDetails($id: ID!) {
    wordDetails(id: $id) {
      ${WORD_CARD_FIELDS}
      sourcePayloadJson
    }
  }
`;

export const LANGUAGES = `
  query Languages {
    languages { id code name }
  }
`;

export const UPDATE_STUDENT_LANGUAGES = `
  mutation UpdateStudentLanguages($studentId: ID!, $input: UpdateAdminStudentInput!) {
    updateStudentLanguages(studentId: $studentId, input: $input) {
      id
      nativeLanguageId
      learningLanguageIds
      teacherId
    }
  }
`;

export const WORDS_BY_IDS = `
  query WordsByIds($ids: [ID!]!) {
    wordsByIds(ids: $ids) { ${WORD_CARD_FIELDS} }
  }
`;

export const STUDENT_VOCABULARY = `
  query StudentVocabulary($studentId: ID) {
    studentVocabulary(studentId: $studentId) {
      id
      status
      masteryLevel
      lessonId
      word { ${WORD_CARD_FIELDS} }
    }
  }
`;

export const ADD_STUDENT_WORD_CARD = `
  mutation AddStudentWordCard($input: CreateStudentWordCardInput!, $studentId: ID) {
    addStudentWordCard(input: $input, studentId: $studentId) {
      id
      status
      word { ${WORD_CARD_FIELDS} }
    }
  }
`;

export const UPDATE_CARD_STATUS = `
  mutation UpdateCardStatus($input: UpdateCardStatusInput!, $studentId: ID) {
    updateCardStatus(input: $input, studentId: $studentId) {
      id
      status
    }
  }
`;

export const DELETE_STUDENT_WORD_CARD = `
  mutation DeleteStudentWordCard($cardId: ID!, $studentId: ID!) {
    deleteStudentWordCard(cardId: $cardId, studentId: $studentId)
  }
`;

export const QUIZZES_LIST = `
  query Quizzes {
    quizzes {
      id
      title
      category
      difficulty
      source
      questionCount
      createdAt
    }
  }
`;

export const QUIZ_DETAIL = `
  query QuizDetail($id: ID!) {
    quiz(id: $id) {
      id
      title
      category
      difficulty
      source
      questionCount
      createdAt
      questions {
        id
        type
        question
        options
        correct
        explanation
      }
    }
  }
`;

export const STUDENT_QUIZZES = `
  query StudentQuizzes($studentId: ID!) {
    studentQuizzes(studentId: $studentId) {
      id
      title
      category
      difficulty
      source
      questionCount
      createdAt
      assignmentId
      attempt {
        id
        score
        correctCount
        totalCount
        finishedAt
      }
    }
  }
`;

export const DELETE_QUIZ = `
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`;

export const SUBMIT_QUIZ_ATTEMPT = `
  mutation SubmitQuizAttempt($input: SubmitQuizAttemptInput!) {
    submitQuizAttempt(input: $input) {
      attemptId
      score
      correctCount
      totalCount
      practiceMode
    }
  }
`;

export const GENERATE_QUIZ = `
  mutation GenerateQuiz($input: GenerateQuizInput!) {
    generateQuiz(input: $input) {
      id
      title
      category
      difficulty
      source
      questions {
        id
        type
        question
        options
        correct
        explanation
      }
    }
  }
`;

export const SCHEDULED_LESSONS = `
  query ScheduledLessons {
    scheduledLessons {
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
      studentId
      status
      cancelReason
      credited
      recurrence
      weeklyDays
      seriesId
      order
      googleMeetUrl
      googleCalendarEventId
      meetCreatedAt
      linkedWordIds
      materials { id kind text files }
      homework { text files }
      studentResponse {
        text
        files
        status
        homeworkChecked
        teacherHomeworkFeedback
      }
    }
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
  studentId
  status
  cancelReason
  credited
  recurrence
  weeklyDays
  seriesId
  order
  googleMeetUrl
  materials { id kind text files }
  homework { text files }
  studentResponse {
    text
    files
    status
    homeworkChecked
    teacherHomeworkFeedback
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

export const ADMIN_USERS = `
  query AdminUsers {
    adminUsers {
      id
      email
      displayName
      role
      status
      createdAt
    }
  }
`;

export const CREATE_ADMIN_USER = `
  mutation CreateAdminUser($input: CreateAdminUserInput!) {
    createAdminUser(input: $input) {
      welcomeEmailSent
      user {
        id
        email
        displayName
        role
      }
    }
  }
`;

export const DELETE_ADMIN_USER = `
  mutation DeleteAdminUser($id: ID!) {
    deleteAdminUser(id: $id) { ok }
  }
`;

export const SYSTEM_MAIL_STATUS = `
  query SystemMailStatus {
    systemMailStatus {
      configured
      smtpHost
      smtpPort
      mailFrom
      templatesDir
    }
  }
`;

export const VERIFY_SMTP_CONNECTION = `
  mutation VerifySmtpConnection {
    verifySmtpConnection { ok }
  }
`;

export const SEND_TEST_WELCOME_EMAIL = `
  mutation SendTestWelcomeEmail($input: SendTestWelcomeEmailInput!) {
    sendTestWelcomeEmail(input: $input) {
      sent
      message
    }
  }
`;

export const WORD_DICTIONARY_SETTINGS = `
  query WordDictionarySettings {
    wordDictionarySettings {
      activeProvider
      providers { id name description docsUrl }
    }
  }
`;

export const UPDATE_WORD_DICTIONARY_PROVIDER = `
  mutation UpdateWordDictionaryProvider($input: UpdateWordDictionaryProviderInput!) {
    updateWordDictionaryProvider(input: $input) {
      activeProvider
      providers { id name description docsUrl }
    }
  }
`;

export const ASSIGNABLE_TEACHERS = `
  query AssignableTeachers {
    assignableTeachers {
      id
      email
      displayName
      role
    }
  }
`;

export const STUDENTS_LIST = `
  query Students {
    students {
      id
      email
      displayName
      status
      proficiencyLevel
      timezone
      teacherId
      teacherName
      avatarUrl
      nativeLanguageId
      learningLanguageIds
      createdAt
    }
  }
`;

const NOTIFICATION_PREFS_FIELDS = `
  notificationPrefs {
    lessonReminder
    streakAlert
    weeklyReport
    newVocab
    teacherMessages
  }
`;

const LINKED_ACCOUNT_FIELDS = `
  provider
  linked
  connectedAs
  calendarConnected
`;

export const MY_PROFILE = `
  query MyProfile {
    myProfile {
      id
      email
      displayName
      avatarUrl
      timezone
      proficiencyLevel
      phone
      telegram
      bio
      nativeLanguageId
      role
      status
      ${NOTIFICATION_PREFS_FIELDS}
      linkedAccounts {
        ${LINKED_ACCOUNT_FIELDS}
      }
    }
  }
`;

export const UPDATE_MY_PROFILE = `
  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
    updateMyProfile(input: $input) {
      id
      email
      displayName
      timezone
      avatarUrl
      proficiencyLevel
      phone
      telegram
      bio
      nativeLanguageId
      role
      status
      ${NOTIFICATION_PREFS_FIELDS}
      linkedAccounts {
        ${LINKED_ACCOUNT_FIELDS}
      }
    }
  }
`;

export const SEND_TEACHER_MESSAGE = `
  mutation SendTeacherMessage($input: SendTeacherMessageInput!) {
    sendTeacherMessage(input: $input) {
      id
      teacherId
      studentId
      body
      createdAt
    }
  }
`;

export const CHANGE_MY_PASSWORD = `
  mutation ChangeMyPassword($input: ChangePasswordInput!) {
    changeMyPassword(input: $input) { ok }
  }
`;

const CHAT_USER_FIELDS = `
  id
  displayName
  displayRole
  roleLabel
  avatarUrl
  initials
`;

export const CHAT_CONTACTS = `
  query ChatContacts {
    chatContacts {
      ${CHAT_USER_FIELDS}
    }
  }
`;

export const CHAT_INBOX = `
  query ChatInbox {
    chatInbox {
      id
      type
      title
      lastMessage
      lastMessageAt
      unreadCount
      updatedAt
      peer {
        ${CHAT_USER_FIELDS}
      }
      participants {
        ${CHAT_USER_FIELDS}
      }
    }
  }
`;

export const CHAT_MESSAGES = `
  query ChatMessages($conversationId: ID!, $cursor: String) {
    chatMessages(conversationId: $conversationId, cursor: $cursor) {
      id
      conversationId
      senderId
      body
      createdAt
      isMine
      attachment {
        id
        fileName
        mimeType
        sizeBytes
        url
        expiresAt
        expired
      }
      sender {
        ${CHAT_USER_FIELDS}
      }
    }
  }
`;

export const FIND_OR_CREATE_DIRECT = `
  mutation FindOrCreateDirectConversation($peerUserId: ID!) {
    findOrCreateDirectConversation(peerUserId: $peerUserId) {
      id
      type
      title
      lastMessage
      lastMessageAt
      unreadCount
      updatedAt
      peer {
        ${CHAT_USER_FIELDS}
      }
    }
  }
`;

export const CREATE_GROUP_CONVERSATION = `
  mutation CreateGroupConversation($input: CreateGroupConversationInput!) {
    createGroupConversation(input: $input) {
      id
      type
      title
      lastMessage
      lastMessageAt
      unreadCount
      updatedAt
      participants {
        ${CHAT_USER_FIELDS}
      }
    }
  }
`;

export const MARK_CONVERSATION_READ = `
  mutation MarkConversationRead($conversationId: ID!) {
    markConversationRead(conversationId: $conversationId) {
      ok
    }
  }
`;
