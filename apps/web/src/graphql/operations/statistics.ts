export const STATISTICS_DASHBOARD = `
  query StatisticsDashboard($range: String!, $studentId: ID, $studentScope: String, $statisticsFocus: String, $rangeFrom: String, $rangeTo: String, $staffUserId: ID) {
    statisticsDashboard(range: $range, studentId: $studentId, studentScope: $studentScope, statisticsFocus: $statisticsFocus, rangeFrom: $rangeFrom, rangeTo: $rangeTo, staffUserId: $staffUserId) {
      layout
      subjectRole
      range
      studentScope
      statisticsFocus
      rangeLabel
      title
      streakDays
      rangeBounds {
        from
        to
      }
      kpis {
        id
        category
        label
        value
        deltaLabel
        trend
      }
      lessons {
        planned
        completed
        cancelled
        credited
        completionRatePercent
        hours
        groupLessonsCompleted
        trend {
          label
          value
        }
        statusBreakdown {
          id
          label
          value
        }
      }
      vocabulary {
        wordsAdded
        wordsReviewed
        wordsMarkedLearned
        trend {
          label
          added
          known
          reviewed
        }
        statusBreakdown {
          id
          label
          value
        }
      }
      practice {
        totalMinutes
        vocabularyMinutes
        quizMinutes
        speakingMinutes
        gamesMinutes
        trend {
          label
          vocabularyMinutes
          quizMinutes
          speakingMinutes
          gamesMinutes
        }
      }
      quiz {
        attempts
        perfectAttempts
        bestScorePercent
        questionsCorrect
      }
      speaking {
        submissions
        reviewsReceived
        minutes
      }
      dailyGoals {
        slotsCompleted
        slotsAvailable
        daysWithAllGoals
        daysInRange
        trend {
          label
          completionPercent
          slotsCompleted
        }
      }
      staffOverview {
        totalStudents
        activeStudents
        inactiveStudents
        homeworkReviewed
        speakingReviewsDone
        speakingPendingReview
      }
      schoolOverview {
        studentCount
        teacherCount
        lessonsInPeriod
        utilizationPercent
      }
      billingOverview {
        currency
        totalPaidInPeriodMinor
        totalLessonsGrantedInPeriod
        totalBillableMinor
        groupLessonsCount
        groupRevenueMinor
      }
      staffEarnings {
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
      }
      roster {
        studentId
        displayName
        lessonTypeLabel
        groupLessonsCompleted
        individualLessonsCompleted
        completedLessons
        plannedLessons
        cancelledLessons
        cancelledCredited
        lessonHours
        practiceMinutes
        wordsAdded
        wordsLearned
        quizAttempts
        speakingSubmissions
        homeworkReviewed
        streakDays
        pricePerLessonMinor
        currency
        paidInPeriodMinor
        lessonsGrantedInPeriod
        billableMinor
      }
    }
  }
`;

export const ACHIEVEMENT_STATS = `
  query AchievementStats($studentId: ID) {
    achievementStats(studentId: $studentId) {
      wordsLearned
      lessonsCompleted
      streakDays
      quizzesCompleted
      perfectQuizCount
      speakingSessions
      speakingSubmissions
      speakingReviewsReceived
      speakingMinutesTotal
      gamesSessions
      practiceMinutesTotal
      lessonMinutesTotal
      weeklyGoalsCompleted
      unlockedAchievementIds
    }
  }
`;
