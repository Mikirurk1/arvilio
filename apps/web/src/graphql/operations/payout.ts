const STAFF_PAYOUT_DEFAULTS_FIELDS = `
  defaultMode
  defaultPerLessonRateMinor
  defaultSalaryMinor
  defaultCurrency
  defaultPayFrequency
  defaultPayDayOfWeek
  defaultPayDayOfMonth
  defaultGraceDays
`;

const STAFF_PAYOUT_FIELDS = `
  id
  userId
  userDisplayName
  amountMinor
  currency
  paidAt
  periodFrom
  periodTo
  note
  createdByUserId
  createdByDisplayName
  createdAt
`;

const STAFF_COMPENSATION_PROFILE_FIELDS = `
  userId
  mode
  perLessonRateMinor
  salaryMinor
  currency
  payFrequency
  payDayOfWeek
  payDayOfMonth
  graceDays
`;

const STAFF_FINANCE_OVERVIEW_FIELDS = `
  range
  rangeLabel
  rangeFrom
  rangeTo
  currency
  totalAccruedMinor
  totalPaidMinor
  totalOutstandingMinor
  staff {
    userId
    displayName
    role
    mode
    completedLessons
    accruedMinor
    paidMinor
    outstandingMinor
    currency
    nextPayDate
    payoutStatus
  }
  trend {
    label
    accruedMinor
    paidMinor
  }
  recentPayouts {
    ${STAFF_PAYOUT_FIELDS}
  }
`;

const STAFF_EARNINGS_SECTION_FIELDS = `
  completedLessons
  lessonHours
  accruedMinor
  paidMinor
  outstandingMinor
  currency
  mode
  perLessonRateMinor
  salaryMinor
  payFrequency
  nextPayDate
  payoutStatus
  trend {
    label
    accruedMinor
    paidMinor
  }
`;

export const STAFF_PAYOUT_DEFAULTS = `
  query StaffPayoutDefaults {
    staffPayoutDefaults {
      ${STAFF_PAYOUT_DEFAULTS_FIELDS}
    }
  }
`;

export const UPDATE_STAFF_PAYOUT_DEFAULTS = `
  mutation UpdateStaffPayoutDefaults($input: UpdateStaffPayoutDefaultsInput!) {
    updateStaffPayoutDefaults(input: $input) {
      ${STAFF_PAYOUT_DEFAULTS_FIELDS}
    }
  }
`;

export const STAFF_FINANCE_OVERVIEW = `
  query StaffFinanceOverview($range: String!, $rangeFrom: String, $rangeTo: String) {
    staffFinanceOverview(range: $range, rangeFrom: $rangeFrom, rangeTo: $rangeTo) {
      ${STAFF_FINANCE_OVERVIEW_FIELDS}
    }
  }
`;

export const STAFF_COMPENSATION_PROFILE = `
  query StaffCompensationProfile($userId: ID!) {
    staffCompensationProfile(userId: $userId) {
      ${STAFF_COMPENSATION_PROFILE_FIELDS}
    }
  }
`;

export const UPDATE_STAFF_COMPENSATION_PROFILE = `
  mutation UpdateStaffCompensationProfile($input: UpdateStaffCompensationProfileInput!) {
    updateStaffCompensationProfile(input: $input) {
      ${STAFF_COMPENSATION_PROFILE_FIELDS}
    }
  }
`;

export const RECORD_STAFF_PAYOUT = `
  mutation RecordStaffPayout($input: RecordStaffPayoutInput!) {
    recordStaffPayout(input: $input) {
      ${STAFF_PAYOUT_FIELDS}
    }
  }
`;

export const STAFF_PAYOUT_HISTORY = `
  query StaffPayoutHistory($userId: ID, $rangeFrom: String, $rangeTo: String) {
    staffPayoutHistory(userId: $userId, rangeFrom: $rangeFrom, rangeTo: $rangeTo) {
      ${STAFF_PAYOUT_FIELDS}
    }
  }
`;

export const STAFF_PAYOUT_HISTORY_PAGE = `
  query StaffPayoutHistoryPage(
    $userId: ID
    $rangeFrom: String
    $rangeTo: String
    $cursor: String
    $limit: Int
  ) {
    staffPayoutHistoryPage(
      userId: $userId
      rangeFrom: $rangeFrom
      rangeTo: $rangeTo
      cursor: $cursor
      limit: $limit
    ) {
      items {
        ${STAFF_PAYOUT_FIELDS}
      }
      hasMore
      nextCursor
    }
  }
`;

export const MY_STAFF_EARNINGS = `
  query MyStaffEarnings($range: String!, $rangeFrom: String, $rangeTo: String) {
    myStaffEarnings(range: $range, rangeFrom: $rangeFrom, rangeTo: $rangeTo) {
      ${STAFF_EARNINGS_SECTION_FIELDS}
    }
  }
`;

export const STAFF_MEMBER_EARNINGS = `
  query StaffMemberEarnings($userId: ID!, $range: String!, $rangeFrom: String, $rangeTo: String) {
    staffMemberEarnings(userId: $userId, range: $range, rangeFrom: $rangeFrom, rangeTo: $rangeTo) {
      ${STAFF_EARNINGS_SECTION_FIELDS}
    }
  }
`;
