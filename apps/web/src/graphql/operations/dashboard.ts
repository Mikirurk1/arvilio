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
      kind
      text
      difficulty
      done
      progressCurrent
      progressTarget
      progressLabel
      actionPath
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
