const LESSON_BALANCE_FIELDS = `
  balance
  isDebt
  groupBalance
  groupIsDebt
  availableMethods
  enabledPaymentMethods
  paymentMethodSelection {
    allowedMethods
    restrictToAllowlistOnly
  }
  manualInvoiceMethods {
    id
    kind
    label
    description
    receiptHintUk
    paymentReferenceHint
    recipientTaxId
    paymentPurpose
    importantNotes
    beneficiaryName
    iban
    bankName
    bankCountry
    bic
    accountNumber
    bankAddress
    swiftBic
    beneficiaryAddress
    intermediaryBankName
    intermediarySwiftBic
    cardNumber
    instructionsUk
  }
  platformManualInvoiceMethods {
    id
    kind
    label
    description
    receiptHintUk
    paymentReferenceHint
    recipientTaxId
    paymentPurpose
    importantNotes
    beneficiaryName
    iban
    bankName
    bankCountry
    bic
    accountNumber
    bankAddress
    swiftBic
    beneficiaryAddress
    intermediaryBankName
    intermediarySwiftBic
    cardNumber
    instructionsUk
  }
  manualInvoiceSelection {
    allowedMethodIds
    defaultMethodId
  }
  billingMode
  showPerLessonPricing
  showSelfServePackages
  allowedCurrencies
  minPackageLessons
  packageOverrides {
    packageId
    lessons
    lessonsLocked
    enabled
  }
  platformPackages {
    id
    lessons
    label
    currency
    creditTrack
  }
  pricePerLessonMinor
  defaultPricePerLessonMinor
  resolvedPricePerLessonMinor
  groupPricePerLessonMinor
  defaultGroupPricePerLessonMinor
  resolvedGroupPricePerLessonMinor
  groupCurrency
  defaultCurrency
  isCustomPrice
  isCustomGroupPrice
  packages {
    id
    lessons
    label
    currency
    amountMinor
    pricePerLessonMinor
    creditTrack
    isCustomPrice
    lessonsLocked
  }
  recentLedger {
    id
    delta
    balanceAfter
    kind
    note
    createdAt
    scheduledLessonId
    amountMinor
    currency
  }
  lemonSqueezyVariantCurrency
  lessonFormat
  groupMemberships {
    groupId
    name
    groupBillingMode
    groupPriceMinor
    groupCurrency
    groupSplitMode
    groupPayerUserId
  }
`;

export const MY_LESSON_BALANCE = `
  query MyLessonBalance {
    myLessonBalance {
      ${LESSON_BALANCE_FIELDS}
    }
  }
`;

export const STUDENT_LESSON_BALANCE = `
  query StudentLessonBalance($studentId: ID!) {
    studentLessonBalance(studentId: $studentId) {
      ${LESSON_BALANCE_FIELDS}
    }
  }
`;

const PAYMENT_METHODS_SECRET_STATUSES = `
  secretStatuses {
    stripe {
      liveSecretKey { configured source }
      liveWebhookSecret { configured source }
      testSecretKey { configured source }
      testWebhookSecret { configured source }
    }
    liqpay {
      livePrivateKey { configured source }
      testPrivateKey { configured source }
    }
    wayforpay {
      liveSecretKey { configured source }
      testSecretKey { configured source }
    }
    lemonsqueezy {
      liveApiKey { configured source }
      liveWebhookSecret { configured source }
      testApiKey { configured source }
      testWebhookSecret { configured source }
    }
    paddle {
      liveApiKey { configured source }
      liveWebhookSecret { configured source }
      testApiKey { configured source }
      testWebhookSecret { configured source }
    }
    monopay {
      liveToken { configured source }
      testToken { configured source }
    }
    paypal {
      liveClientSecret { configured source }
      liveWebhookId { configured source }
      testClientSecret { configured source }
      testWebhookId { configured source }
    }
  }
`;

const PAYMENT_CONFIG_FIELDS = `
  config {
    defaultPricePerLessonMinor
    pricePerLessonByCurrency { currency pricePerLessonMinor }
    defaultCurrency
    allowedCurrencies
    minPackageLessons
    packages { id lessons label currency creditTrack }
    manualInvoiceMethods {
      id
      kind
      label
      description
      receiptHintUk
      paymentReferenceHint
      recipientTaxId
      paymentPurpose
      importantNotes
      beneficiaryName
      iban
      bankName
      bankCountry
      bic
      accountNumber
      bankAddress
      swiftBic
      beneficiaryAddress
      intermediaryBankName
      intermediarySwiftBic
      cardNumber
      instructionsUk
    }
    stripeMode
    stripeLivePublishableKey
    stripeTestPublishableKey
    liqpayMode
    liqpayLivePublicKey
    liqpayTestPublicKey
    wayforpayMode
    wayforpayLiveMerchantAccount
    wayforpayLiveMerchantDomainName
    wayforpayTestMerchantAccount
    wayforpayTestMerchantDomainName
    lemonsqueezyMode
    lemonsqueezyLiveStoreId
    lemonsqueezyLiveVariantId
    lemonsqueezyTestStoreId
    lemonsqueezyTestVariantId
    lemonsqueezyLiveVariantCurrency
    lemonsqueezyTestVariantCurrency
    paddleMode
    monopayMode
    paypalMode
    paypalLiveClientId
    paypalTestClientId
    groupLessons {
      enabled
      defaultBillingMode
      defaultPriceMinor
      defaultCurrency
      defaultSplitMode
    }
  }
`;

export const PAYMENT_SETTINGS = `
  query PaymentSettings {
    paymentSettings {
      enabledMethods
      methods { id enabled configured configuredLabel mode }
      ${PAYMENT_METHODS_SECRET_STATUSES}
      ${PAYMENT_CONFIG_FIELDS}
    }
  }
`;

export const SCHOOL_GROUP_LESSONS_SETTINGS = `
  query SchoolGroupLessonsSettings {
    schoolGroupLessonsSettings {
      enabled
      defaultBillingMode
      defaultPriceMinor
      defaultCurrency
      defaultSplitMode
    }
  }
`;

const STUDENT_GROUP_FIELDS = `
  id
  name
  teacherId
  teacherName
  groupBillingMode
  groupPriceMinor
  groupCurrency
  groupSplitMode
  groupPayerUserId
  members { userId displayName sortOrder }
  createdAt
  updatedAt
`;

export const STUDENT_GROUPS = `
  query StudentGroups {
    studentGroups {
      ${STUDENT_GROUP_FIELDS}
    }
  }
`;

export const CREATE_STUDENT_GROUP = `
  mutation CreateStudentGroup($input: CreateStudentGroupInput!) {
    createStudentGroup(input: $input) {
      ${STUDENT_GROUP_FIELDS}
    }
  }
`;

export const UPDATE_STUDENT_GROUP = `
  mutation UpdateStudentGroup($id: ID!, $input: UpdateStudentGroupInput!) {
    updateStudentGroup(id: $id, input: $input) {
      ${STUDENT_GROUP_FIELDS}
    }
  }
`;

export const DELETE_STUDENT_GROUP = `
  mutation DeleteStudentGroup($id: ID!) {
    deleteStudentGroup(id: $id) { ok }
  }
`;

export const UPDATE_PAYMENT_SETTINGS = `
  mutation UpdatePaymentSettings($input: UpdatePaymentSettingsInput!) {
    updatePaymentSettings(input: $input) {
      enabledMethods
      methods { id enabled configured configuredLabel mode }
      ${PAYMENT_METHODS_SECRET_STATUSES}
      ${PAYMENT_CONFIG_FIELDS}
    }
  }
`;

export const UPDATE_STUDENT_LESSON_PRICING = `
  mutation UpdateStudentLessonPricing($input: UpdateStudentLessonPricingInput!) {
    updateStudentLessonPricing(input: $input) {
      ${LESSON_BALANCE_FIELDS}
    }
  }
`;

export const UPDATE_STUDENT_LESSON_BILLING = `
  mutation UpdateStudentLessonBilling($input: UpdateStudentLessonBillingInput!) {
    updateStudentLessonBilling(input: $input) {
      ${LESSON_BALANCE_FIELDS}
    }
  }
`;

export const ADJUST_STUDENT_LESSON_BALANCE = `
  mutation AdjustStudentLessonBalance($input: AdjustStudentLessonBalanceInput!) {
    adjustStudentLessonBalance(input: $input) {
      ${LESSON_BALANCE_FIELDS}
    }
  }
`;

export const CREATE_LESSON_PURCHASE_CHECKOUT = `
  mutation CreateLessonPurchaseCheckout($input: CreateLessonPurchaseCheckoutInput!) {
    createLessonPurchaseCheckout(input: $input) {
      checkoutUrl
    }
  }
`;
