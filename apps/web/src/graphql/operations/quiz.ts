const QUIZ_CARD_FIELDS = `
      id
      title
      category
      difficulty
      source
      questionCount
      createdAt
      attempt {
        id
        score
        correctCount
        totalCount
        finishedAt
      }
`;

export const QUIZZES_LIST = `
  query Quizzes {
    quizzes {
${QUIZ_CARD_FIELDS}
    }
  }
`;

export const QUIZZES_PAGE = `
  query QuizzesPage($cursor: String, $limit: Int) {
    quizzesPage(cursor: $cursor, limit: $limit) {
      hasMore
      nextCursor
      items {
${QUIZ_CARD_FIELDS}
      }
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

const STUDENT_QUIZ_CARD_FIELDS = `
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
`;

export const STUDENT_QUIZZES = `
  query StudentQuizzes($studentId: ID!) {
    studentQuizzes(studentId: $studentId) {
${STUDENT_QUIZ_CARD_FIELDS}
    }
  }
`;

export const STUDENT_QUIZZES_PAGE = `
  query StudentQuizzesPage($studentId: ID!, $cursor: String, $limit: Int) {
    studentQuizzesPage(studentId: $studentId, cursor: $cursor, limit: $limit) {
      hasMore
      nextCursor
      items {
${STUDENT_QUIZ_CARD_FIELDS}
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
