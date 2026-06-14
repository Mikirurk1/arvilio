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

const STAFF_USER_PROFILE_FIELDS = `
  id
  email
  displayName
  avatarUrl
  timezone
  phone
  telegram
  bio
  role
  status
`;

export const STAFF_USER_PROFILE = `
  query StaffUserProfile($userId: ID!) {
    staffUserProfile(userId: $userId) {
      ${STAFF_USER_PROFILE_FIELDS}
    }
  }
`;

export const UPDATE_STAFF_USER_PROFILE = `
  mutation UpdateStaffUserProfile($input: UpdateStaffUserProfileInput!) {
    updateStaffUserProfile(input: $input) {
      ${STAFF_USER_PROFILE_FIELDS}
    }
  }
`;
