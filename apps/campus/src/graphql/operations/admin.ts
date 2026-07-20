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
  mutation VerifySmtpConnection($input: VerifySmtpConnectionInput!) {
    verifySmtpConnection(input: $input) {
      ok
      message
    }
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

export const TRANSLATION_SETTINGS = `
  query TranslationSettings {
    translationSettings {
      activeProvider
      providers { id name description docsUrl requiresServiceSubscription }
      apiUrls {
        deeplApiUrl
        googleTranslateApiUrl
        microsoftTranslatorApiUrl
        myMemoryUrl
        reversoApiUrl
        libreTranslateUrl
      }
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

const PLATFORM_INTEGRATION_FIELDS = `
  config {
    translation {
      activeProvider
      apiEmail
      reversoContextResults
      reversoContextTargetLang
    }
    mediaCaptions {
      enabled
      sttProvider
      sourceLanguage
      targetLanguages
    }
    llm {
      enabled
      provider
      baseUrl
      model
      maxTokens
      temperature
    }
    smtp {
      mode
      host
      port
      user
      mailFrom
      secure
    }
    telegram {
      botUsername
      devPolling
    }
    google {
      clientId
      callbackUrl
      successRedirect
      linkSuccessRedirect
      failureRedirect
    }
    facebook {
      appId
      callbackUrl
    }
    videoMeeting {
      provider
      livekit {
        wsUrl
        apiKey
      }
      zoom {
        clientId
        callbackUrl
        useServerToServer
      }
    }
  }
  secrets {
    smtpPass
    libreTranslateApiKey
    reversoApiKey
    deeplAuthKey
    googleTranslateApiKey
    azureTranslatorKey
    openaiWhisperApiKey
    llmApiKey
    anthropicApiKey
    telegramBotToken
    googleClientSecret
    facebookAppSecret
    zoomClientSecret
    zoomWebhookSecret
    livekitApiSecret
  }
  secretStatuses {
    smtpPass { configured source }
    libreTranslateApiKey { configured source }
    reversoApiKey { configured source }
    deeplAuthKey { configured source }
    googleTranslateApiKey { configured source }
    azureTranslatorKey { configured source }
    openaiWhisperApiKey { configured source }
    llmApiKey { configured source }
    anthropicApiKey { configured source }
    telegramBotToken { configured source }
    googleClientSecret { configured source }
    facebookAppSecret { configured source }
    zoomClientSecret { configured source }
    zoomWebhookSecret { configured source }
    livekitApiSecret { configured source }
  }
  secretsStorageAvailable
`;

export const PLATFORM_INTEGRATION_SETTINGS = `
  query PlatformIntegrationSettings {
    platformIntegrationSettings {
      ${PLATFORM_INTEGRATION_FIELDS}
    }
  }
`;

export const UPDATE_PLATFORM_INTEGRATION_SETTINGS = `
  mutation UpdatePlatformIntegrationSettings($input: UpdatePlatformIntegrationSettingsInput!) {
    updatePlatformIntegrationSettings(input: $input) {
      ${PLATFORM_INTEGRATION_FIELDS}
    }
  }
`;

export const VERIFY_PLATFORM_CONNECTION = `
  mutation VerifyPlatformConnection($input: VerifyPlatformConnectionInput!) {
    verifyPlatformConnection(input: $input) {
      ok
      message
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
      timezone
    }
  }
`;

const STUDENT_SUMMARY_FIELDS = `
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
      scheduleType
      lessonFormat
      displayColor
      createdAt
`;

export const STUDENTS_LIST = `
  query Students {
    students {
${STUDENT_SUMMARY_FIELDS}
    }
  }
`;

export const STUDENTS_PAGE = `
  query StudentsPage($cursor: String, $limit: Int) {
    studentsPage(cursor: $cursor, limit: $limit) {
      hasMore
      nextCursor
      items {
${STUDENT_SUMMARY_FIELDS}
      }
    }
  }
`;
