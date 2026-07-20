import type { QuizQuestionDto, UserRoleId } from '@pkg/types';
import { USER_ROLE } from '@pkg/types';
import { mockUsers } from './entities';

export type MockQuizDifficulty = 'easy' | 'medium' | 'hard';
export type MockQuizStudentStatus = 'pending' | 'submitted' | 'graded';

export type MockQuizAssignment = {
  studentId: number;
  dueDate: string;
  personalNote?: string;
  assignedByUserId: number;
  status: MockQuizStudentStatus;
  score?: number;
  assignedAt: string;
};

export type MockQuizEntity = {
  id: string;
  title: string;
  category: string;
  difficulty: MockQuizDifficulty;
  ownerUserId: number;
  createdAt: string;
  questionIds: string[];
  assignments: MockQuizAssignment[];
};

export type MockQuizStudent = {
  id: string;
  name: string;
  avatar: string;
  status?: MockQuizStudentStatus;
  score?: number;
};

export type MockQuizCard = {
  id: string;
  title: string;
  category: string;
  difficulty: MockQuizDifficulty;
  questions: number;
  duration: number;
  completed: boolean;
  score?: number;
  assignedTo?: MockQuizStudent[];
  dueDate?: string;
  createdAt: string;
};

export type MockQuizTopic = {
  id: string;
  title: string;
  desc: string;
  tag: string;
};

export const mockQuizQuestions: QuizQuestionDto[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'Choose the correct conditional sentence:',
    options: [
      'If I would have more time, I will study harder.',
      'If I had more time, I would study harder.',
      'If I have more time, I would study harder.',
      'If I had more time, I will study harder.',
    ],
    correct: 1,
    explanation: 'Second conditional: if + past simple, would + infinitive.',
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: "What does 'eloquent' mean?",
    options: [
      'Speaking very loudly',
      'Unable to express oneself',
      'Fluent and persuasive in speech or writing',
      'Using confusing language',
    ],
    correct: 2,
    explanation: 'Eloquent means fluent and persuasive.',
  },
  {
    id: 'q3',
    type: 'fill-in',
    question: 'If I ___ more time, I would study harder.',
    correct: 'had',
    explanation: 'Second conditional uses past simple after if.',
  },
];

const questionById = new Map(mockQuizQuestions.map((question) => [question.id, question] as const));

export const mockQuizEntities: MockQuizEntity[] = [
  {
    id: '1',
    title: 'Conditional Sentences Test',
    category: 'Grammar',
    difficulty: 'medium',
    ownerUserId: 2,
    createdAt: '2026-05-01T10:30:00.000Z',
    questionIds: ['q1', 'q3'],
    assignments: [
      {
        studentId: 1,
        dueDate: '2026-05-09',
        assignedByUserId: 2,
        status: 'pending',
        assignedAt: '2026-05-01T10:35:00.000Z',
      },
      {
        studentId: 3,
        dueDate: '2026-05-09',
        assignedByUserId: 2,
        status: 'submitted',
        score: 87,
        assignedAt: '2026-05-01T10:35:00.000Z',
      },
      {
        studentId: 4,
        dueDate: '2026-05-09',
        assignedByUserId: 2,
        status: 'graded',
        score: 92,
        assignedAt: '2026-05-01T10:35:00.000Z',
      },
    ],
  },
  {
    id: '2',
    title: 'Business Vocabulary Quiz',
    category: 'Vocabulary',
    difficulty: 'hard',
    ownerUserId: 5,
    createdAt: '2026-05-03T12:10:00.000Z',
    questionIds: ['q2', 'q3'],
    assignments: [
      {
        studentId: 1,
        dueDate: '2026-05-10',
        assignedByUserId: 5,
        status: 'submitted',
        score: 78,
        assignedAt: '2026-05-03T12:20:00.000Z',
      },
    ],
  },
  {
    id: '3',
    title: 'Listening Comprehension',
    category: 'Listening',
    difficulty: 'medium',
    ownerUserId: 6,
    createdAt: '2026-05-04T08:55:00.000Z',
    questionIds: ['q1', 'q2', 'q3'],
    assignments: [
      {
        studentId: 3,
        dueDate: '2026-05-11',
        assignedByUserId: 6,
        status: 'pending',
        assignedAt: '2026-05-04T09:00:00.000Z',
      },
    ],
  },
];

function userInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((chunk) => chunk.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const typeSeconds: Record<'multiple-choice' | 'fill-in', number> = {
  'multiple-choice': 38,
  'fill-in': 62,
};

const difficultyMultiplier: Record<MockQuizDifficulty, number> = {
  easy: 0.9,
  medium: 1,
  hard: 1.2,
};

export function estimateQuizQuestionCount(quiz: Pick<MockQuizEntity, 'questionIds'>): number {
  return Math.max(1, quiz.questionIds.length);
}

export function estimateQuizDurationMinutes(quiz: Pick<MockQuizEntity, 'questionIds' | 'difficulty'>): number {
  const seconds = quiz.questionIds.reduce((sum, questionId) => {
    const question = questionById.get(questionId);
    const type = question?.type === 'fill-in' ? 'fill-in' : 'multiple-choice';
    return sum + typeSeconds[type] * difficultyMultiplier[quiz.difficulty];
  }, 0);
  return Math.max(1, Math.round(seconds / 60));
}

export function getQuizQuestionsForQuizId(quizId: string): QuizQuestionDto[] {
  const quiz = mockQuizEntities.find((entry) => entry.id === quizId);
  if (!quiz) return [];
  return quiz.questionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is QuizQuestionDto => Boolean(question));
}

function mapAssignmentStudent(studentId: number, status?: MockQuizStudentStatus, score?: number): MockQuizStudent {
  const student = mockUsers.find((entry) => entry.id === studentId);
  return {
    id: String(studentId),
    name: student?.fullName ?? `Student #${studentId}`,
    avatar: student ? userInitials(student.fullName) : `S${studentId}`,
    status,
    score,
  };
}

function isStudentRole(roleId: UserRoleId): boolean {
  return roleId === USER_ROLE.student.id;
}

function canManageRole(roleId: UserRoleId): boolean {
  return (
    roleId === USER_ROLE.teacher.id ||
    roleId === USER_ROLE.admin.id ||
    roleId === USER_ROLE.superAdmin.id
  );
}

export function getAssignableStudentsForUser(userId: number, roleId: UserRoleId): MockQuizStudent[] {
  const students = mockUsers.filter((entry) => entry.role === USER_ROLE.student.id);
  const visibleStudents =
    roleId === USER_ROLE.teacher.id ? students.filter((student) => student.teacherId === userId) : students;
  return visibleStudents.map((student) => ({
    id: String(student.id),
    name: student.fullName,
    avatar: userInitials(student.fullName),
  }));
}

function isQuizVisibleForUser(quiz: MockQuizEntity, userId: number, roleId: UserRoleId): boolean {
  if (isStudentRole(roleId)) {
    return quiz.assignments.some((assignment) => assignment.studentId === userId);
  }
  if (canManageRole(roleId)) {
    return (
      quiz.ownerUserId === userId ||
      quiz.assignments.some((assignment) => assignment.assignedByUserId === userId)
    );
  }
  return false;
}

export function getQuizCardsForUser(userId: number, roleId: UserRoleId): MockQuizCard[] {
  return mockQuizEntities
    .filter((quiz) => isQuizVisibleForUser(quiz, userId, roleId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((quiz) => {
      const questions = estimateQuizQuestionCount(quiz);
      const duration = estimateQuizDurationMinutes(quiz);
      const assignedTo =
        quiz.assignments.length > 0
          ? quiz.assignments.map((assignment) =>
              mapAssignmentStudent(assignment.studentId, assignment.status, assignment.score),
            )
          : undefined;
      const scoreValues = quiz.assignments
        .map((assignment) => assignment.score)
        .filter((score): score is number => typeof score === 'number');
      const averageScore =
        scoreValues.length > 0
          ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
          : undefined;
      const completed = quiz.assignments.some((assignment) => assignment.status === 'graded');
      return {
        id: quiz.id,
        title: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        questions,
        duration,
        completed,
        score: averageScore,
        assignedTo,
        dueDate: quiz.assignments[0]?.dueDate,
        createdAt: quiz.createdAt,
      };
    });
}

export function getLatestQuizForUser(userId: number, roleId: UserRoleId): MockQuizCard | null {
  const cards = getQuizCardsForUser(userId, roleId);
  return cards[0] ?? null;
}

export function getQuizTopicsForUser(userId: number, roleId: UserRoleId): MockQuizTopic[] {
  return getQuizCardsForUser(userId, roleId)
    .slice(0, 4)
    .map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      desc: `${quiz.questions} questions, ~${quiz.duration} min, ${quiz.difficulty} difficulty.`,
      tag: quiz.category,
    }));
}

export function assignQuizToStudents(params: {
  quizId: string;
  studentIds: number[];
  dueDate: string;
  personalNote?: string;
  assignedByUserId: number;
}): void {
  const quiz = mockQuizEntities.find((entry) => entry.id === params.quizId);
  if (!quiz) return;
  const nowIso = new Date().toISOString();
  const nextAssignments: MockQuizAssignment[] = quiz.assignments.filter(
    (assignment) => !params.studentIds.includes(assignment.studentId),
  );
  for (const studentId of params.studentIds) {
    nextAssignments.push({
      studentId,
      dueDate: params.dueDate,
      personalNote: params.personalNote,
      assignedByUserId: params.assignedByUserId,
      assignedAt: nowIso,
      status: 'pending',
    });
  }
  quiz.assignments = nextAssignments;
}

